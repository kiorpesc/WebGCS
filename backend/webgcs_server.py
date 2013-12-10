import threading 
import tornado.web
import tornado.websocket
import tornado.ioloop
import time
import Queue
import json
import os
import serial
import select

from pymavlink import mavutil, mavwp, mavparm

# Custom mode definitions from PX4 code base
PX4_CUSTOM_MAIN_MODE_MANUAL   = 1
PX4_CUSTOM_MAIN_MODE_SEATBELT = 2
PX4_CUSTOM_MAIN_MODE_EASY     = 3
PX4_CUSTOM_MAIN_MODE_AUTO     = 4

PX4_CUSTOM_SUB_MODE_AUTO_READY   = 1
PX4_CUSTOM_SUB_MODE_AUTO_TAKEOFF = 2
PX4_CUSTOM_SUB_MODE_AUTO_LOITER  = 3
PX4_CUSTOM_SUB_MODE_AUTO_MISSION = 4
PX4_CUSTOM_SUB_MODE_AUTO_RTL     = 5
PX4_CUSTOM_SUB_MODE_AUTO_LAND    = 6

# mavlink base_mode flags
MAV_MODE_FLAG_DECODE_POSITION_SAFETY      = 0b10000000
MAV_MODE_FLAG_DECODE_POSITION_MANUAL      = 0b01000000
MAV_MODE_FLAG_DECODE_POSITION_HIL         = 0b00100000
MAV_MODE_FLAG_DECODE_POSITION_STABILIZE   = 0b00010000
MAV_MODE_FLAG_DECODE_POSITION_GUIDED      = 0b00001000
MAV_MODE_FLAG_DECODE_POSITION_AUTO        = 0b00000100
MAV_MODE_FLAG_DECODE_POSITION_TEST        = 0b00000010
MAV_MODE_FLAG_DECODE_POSITION_CUSTOM_MODE = 0b00000001

# masks to prevent accidental arm/disarm of motors
DISARM_MASK                               = 0b01111111
ARMED_MASK                                = 0b10000000

uav_module = None

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("blank.html")

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        global server_State
        server_state.ws_count += 1
        server_state.websockets.append(self)
        #try:
        send_json_msg(uav_module.get_modes())
        server_state.sent_commands = True
        print('Sent command message.')
        print(uav_module.get_modes())
        #except:
        #	print('Could not send command.')
        print(server_state.ws_count)

    def on_message(self, message):
    	# TODO: handle messages from browser interface.
    	uav_module.convert_command(message)
        # self.write_message(u"Server echoed: " + message)

    def on_close(self):
        global server_state
        server_state.ws_count -= 1
        server_state.websockets.remove(self)
        print(server_state.ws_count)

    def send_mavlink(self, msg):
        # try:
        self.write_message(msg.to_dict())
        #except:
        #    print('Could not send message.')
        #    print(msg)
        #    pass

class ServerState():
    '''Holds important information about the server and the UAV.'''
    def __init__(self, _port):
        self.port = _port
        self.from_client = Queue.Queue(maxsize=0)
        self.to_client = Queue.Queue(maxsize=0)
        self.server_thread = None
        self.ws_count = 0
        self.websockets = [] 
        self.application = None
        self.master = ''
        self.baud = 0
        self.mavconn = None
        self.last_message = 0
        self.highest_msec = 0
        self.got_params = False
        self.mav_param = mavparm.MAVParmDict()
        self.mav_param_set = set()
        self.mav_param_count = 0
        self.linkerror = False
        self.autopilot = -1
        self.loaded_commands = False
        self.sent_commands = False
        self.target_system = -1
        self.target_component = -1

    def decode_mavlink(self, msg):
        result = dict()
        for field in msg._fieldnames:
            result[field] = msg.__dict__

root = os.path.dirname(__file__)
application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/websocket", WebSocketHandler),], static_path=os.path.join(root, 'lib/web_ui')
)

def server_thread():
    # start server in separate thread (to maintain mavproxy function if needed)
    global application
    global server_state
    server_state.application = application
    server_state.application.listen(server_state.port)
    tornado.ioloop.IOLoop.instance().start()

def start_server(_server_state):
    global server_state
    server_state = _server_state
    server_state.server_thread = threading.Thread(target=server_thread)
    server_state.server_thread.daemon = True
    server_state.server_thread.start()

def load_autopilot_commands():
    uav_module = None
    if server_state.autopilot == 3:
        try:
            import backend.modules.webgcs_apm as _uav_module
        except:
            print('Could not import APM commands.')
    if server_state.autopilot == 12:
        try:
            import modules.webgcs_px4 as _uav_module
        except:
            print('Could not import PX4 commands.')
    return _uav_module


# send mavlink message to all websockets
def send_mav_msg(msg):
    if server_state.ws_count > 0:
        for ws in server_state.websockets:
            ws.send_mavlink(msg)

def send_json_msg(msg):
    if server_state.ws_count > 0:
        for ws in server_state.websockets:
            ws.write_message(msg)

# this gives us the time that uav sent the message, and sets a delayed flag
# if the time is less than the highest time received (prevents duplicate data)
def handle_msec_timestamp(m, master):
    '''special handling for MAVLink packets with a time_boot_ms field'''

    if m.get_type() == 'GLOBAL_POSITION_INT':
        # this is fix time, not boot time
        return

    msec = m.time_boot_ms
    if msec + 30000 < server_state.highest_msec:
        say('Time has wrapped')
        print('Time has wrapped', msec, server_state.highest_msec)
        server_state.highest_msec = msec
        server_state.link_delayed = False

    # we want to detect when a link is delayed
    master.highest_msec = msec
    if msec > server_state.highest_msec:
       server_state.highest_msec = msec
    if msec < server_state.highest_msec:
        master.link_delayed = True
    else:
        master.link_delayed = False

# this currently does nothing -> not sure what it should do yet
def master_send_callback(m, master):
    '''called on sending a message'''
    mtype = m.get_type()

# method that is called when a message from the UAV is received on the serial or UDP link
# this handles modifying mavlink-related server_state variables,
# as well as sending the desired messages out over any and all websockets (to all linked
# instances of the web interface)
def master_callback(m, master):
    '''process mavlink message m on master, sending any messages to recipients'''
    global server_state
    global uav_module

    if getattr(m, 'time_boot_ms', None) is not None:
        # update link_delayed attribute
        handle_msec_timestamp(m, master)

    mtype = m.get_type()

    if mtype in [ 'HEARTBEAT', 'GPS_RAW_INT', 'GPS_RAW', 'GLOBAL_POSITION_INT', 'SYS_STATUS' ]:
        server_state.last_message = time.time()

    if master.link_delayed:
        # don't process delayed packets that cause double reporting
        if mtype in [ 'MISSION_CURRENT', 'SYS_STATUS', 'VFR_HUD',
                      'GPS_RAW_INT', 'SCALED_PRESSURE', 'GLOBAL_POSITION_INT',
                      'NAV_CONTROLLER_OUTPUT' ]:
            return

    if mtype == 'HEARTBEAT' and m.get_srcSystem() != 255:
    	if (server_state.target_system != m.get_srcSystem() or
            server_state.target_component != m.get_srcComponent()):
            server_state.target_system = m.get_srcSystem()
            server_state.target_component = m.get_srcComponent()
        if not server_state.got_params:
            master.param_fetch_all()
            server_state.got_params = True
        if server_state.linkerror:
            server_state.linkerror = False
        server_state.last_heartbeat = time.time()
        send_mav_msg(m)
        if server_state.autopilot == -1:
        	server_state.autopilot = m.autopilot
        	if not server_state.loaded_commands:
        		uav_module = load_autopilot_commands()
        		uav_module.init(server_state)
        		server_state.loaded_commands = True
        else:
            uav_module.mavlink_packet(m)

    # TODO: implement status handling
    elif mtype == 'STATUSTEXT':
    	send_json_msg(json.dumps(['STATUSTEXT', m.text.decode('utf-8', 'replace')]))
    	pass

    # receiving parameters from vehicle
    elif mtype == 'PARAM_VALUE':
        param_id = "%.16s" % m.param_id
        if m.param_index != -1 and m.param_index not in server_state.mav_param_set:
            added_new_parameter = True
            server_state.mav_param_set.add(m.param_index)
        else:
            added_new_parameter = False
        if m.param_count != -1:
            server_state.mav_param_count = m.param_count
        server_state.mav_param[str(param_id)] = m.param_value

    # universtal status message, gives battery, flight mode, and other important data
    # TODO: battery handling?
    elif mtype == "SYS_STATUS":
        send_mav_msg(m)

    # messages formatted for easy use with a HUD
    elif mtype == "VFR_HUD":
    	# FIXME: this line is only here to prevent JSON problems
    	m.groundspeed = -1
        send_mav_msg(m)

    # send pitch/roll/yaw information for HUD
    elif mtype == "ATTITUDE":
    	send_mav_msg(m)

    # raw GPS data
    elif mtype == "GPS_RAW":
    	send_mav_msg(m)

    # same as above, with different name
    elif mtype == "GPS_RAW_INT":
    	send_mav_msg(m)

    # more GPS data
    elif mtype == "GLOBAL_POSITION_INT":
        send_mav_msg(m)

    # TODO: handle NAV_CONTROLLER_OUTPUT for APM
    elif mtype == 'NAV_CONTROLLER_OUTPUT':
        pass

    elif mtype in [ "COMMAND_ACK", "MISSION_ACK" ]:
    	# use this for displaying ACK in navbar
    	send_mav_msg(m)
    else:
        # some other message?
        pass
    
    # TODO: if modules need messages, implement here

# use mavutil to create a mavlink connection (automatically handles serial, TCP, and UDP types)
def create_mavlink_connection():
	    # code from MAVProxy
        m = mavutil.mavlink_connection(server_state.master, autoreconnect=True, baud=server_state.baud)
        m.mav.set_callback(master_callback, m)
        if hasattr(m.mav, 'set_send_callback'):
            m.mav.set_send_callback(master_send_callback, m)
        m.link_delayed = False

        return m


def process_master(m):
    '''process packets from the MAVLink master'''
    try:
        s = m.recv()
    except Exception:
        return

    if m.first_byte:
        m.auto_mavlink_version(s)
    msgs = m.mav.parse_buffer(s)
    if msgs:
        for msg in msgs:
            if getattr(m, '_timestamp', None) is None:
                m.post_message(msg)
            if msg.get_type() == "BAD_DATA":
                pass

def main_loop():
    global server_state

    while True:
        if server_state is None:
            return

        if server_state.mavconn is not None:
            if server_state.mavconn.fd is None:
                if master.port.inWaiting() > 0:
                    process_master(master)  

            # periodic_tasks()

            rin = []
        
            if server_state.mavconn is not None:
                rin.append(server_state.mavconn.fd)

            if rin == []:
                time.sleep(0.001)
                continue

            try:
                (rin, win, xin) = select.select(rin, [], [], 0.001)
            except select.error:
                continue

            if server_state is None:
                return

            for fd in rin:
                if fd == server_state.mavconn.fd:
                        process_master(server_state.mavconn)
                        continue

if __name__ == "__main__":
    from optparse import OptionParser
    parser = OptionParser("webgcs_server.py [options]")

    parser.add_option("-p", "--port", dest="port", action='store', type='int', help="Port to run server on", default=8888)
    parser.add_option("-m", "--master", dest="master", action='store', type='string', help="MAVLink master device", default='/dev/ttyACM0')
    parser.add_option("-b", "--baud", dest="baud", action="store", type='int', help="Baud rate of serial connection", default=57600)
    # type of autopilot will be handled automatically via MAVLink

    (opts, args) = parser.parse_args()

    # create server_state to hold important information
    server_state = ServerState(opts.port)
    server_state.master = opts.master
    server_state.baud = opts.baud

    # create mavlink connection with the master
    server_state.mavconn = create_mavlink_connection()

    # start server in new thread
    start_server(server_state)

    # run main loop
    main_loop()




