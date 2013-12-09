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

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("blank.html")

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        global server_State
        server_state.ws_count += 1
        server_state.websockets.append(self)
        print(server_state.ws_count)

    def on_message(self, message):
        self.write_message(u"Server echoed: " + message)

    def on_close(self):
        global server_state
        server_state.ws_count -= 1
        server_state.websockets.remove(self)
        print(server_state.ws_count)

    def send_mavlink(self, msg):
        try:
            self.write_message(msg.to_dict())
        except:
            # handle hard-to-convert messages
            pass

class ServerState():
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

def send_mav_msg(msg):
    if server_state.ws_count > 0:
        for ws in server_state.websockets:
            ws.send_mavlink(msg)


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

def master_send_callback(m, master):
    '''called on sending a message'''
    mtype = m.get_type()


def master_callback(m, master):
    '''process mavlink message m on master, sending any messages to recipients'''
    global server_state
    #if getattr(m, '_timestamp', None) is None:
    #    master.post_message(m)
    # mpstate.status.counters['MasterIn'][master.linknum] += 1

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
        if not server_state.got_params:
            master.param_fetch_all()
            server_state.got_params = True

        if server_state.linkerror:
            server_state.linkerror = False

        server_state.last_heartbeat = time.time()

        send_mav_msg(m)

    # TODO: implement status handling
    elif mtype == 'STATUSTEXT':
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

    server_state = ServerState(opts.port)
    server_state.master = opts.master
    server_state.baud = opts.baud

    server_state.mavconn = create_mavlink_connection()

    start_server(server_state)

    # run main loop
    main_loop()

    #server_state.application = application
    #server_state.application.listen(server_state.port)
    #tornado.ioloop.IOLoop.instance().start()



