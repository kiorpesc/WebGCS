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
    	self.write_message(msg.to_dict())
        #try:
        #    self.write_message(msg.to_dict())
        #except:
            # handle hard-to-convert messages
        #    pass

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

    '''
    # and log them
    if mtype != 'BAD_DATA' and mpstate.logqueue:
        # put link number in bottom 2 bits, so we can analyse packet
        # delay in saved logs
        usec = get_usec()
        usec = (usec & ~3) | master.linknum
        mpstate.logqueue.put(str(struct.pack('>Q', usec) + m.get_msgbuf()))
    '''

    if mtype in [ 'HEARTBEAT', 'GPS_RAW_INT', 'GPS_RAW', 'GLOBAL_POSITION_INT', 'SYS_STATUS' ]:
        server_state.last_message = time.time()

    if master.link_delayed:
        # don't process delayed packets that cause double reporting
        if mtype in [ 'MISSION_CURRENT', 'SYS_STATUS', 'VFR_HUD',
                      'GPS_RAW_INT', 'SCALED_PRESSURE', 'GLOBAL_POSITION_INT',
                      'NAV_CONTROLLER_OUTPUT' ]:
            return

    if mtype == 'HEARTBEAT' and m.get_srcSystem() != 255:
    	'''
        if (mpstate.status.target_system != m.get_srcSystem() or
            mpstate.status.target_component != m.get_srcComponent()):
            mpstate.status.target_system = m.get_srcSystem()
            mpstate.status.target_component = m.get_srcComponent()
        '''
        if not server_state.got_params:
            # say("online system %u component %u" % (m.get_srcSystem(), m.get_srcComponent(),'message')
            # if len(mpstate.mav_param_set) == 0 or len(mpstate.mav_param_set) != mpstate.mav_param_count:
            master.param_fetch_all()
            server_state.got_params = True
        '''
        if mpstate.status.heartbeat_error:
            mpstate.status.heartbeat_error = False
            say("heartbeat OK")
        '''
        if server_state.linkerror:
            server_state.linkerror = False
            # say("link %u OK" % (master.linknum+1))

        server_state.last_heartbeat = time.time()

        # send heartbeat over all websockets
        send_mav_msg(m)
        #print("Sent heartbeat.")

        '''
        armed = mpstate.master().motors_armed()
        if armed != mpstate.status.armed:
            mpstate.status.armed = armed
            if armed:
                say("ARMED")
            else:
                say("DISARMED")
        '''

    elif mtype == 'STATUSTEXT':
    	pass
    	'''
        if m.text != mpstate.status.last_apm_msg or time.time() > mpstate.status.last_apm_msg_time+2:
            mpstate.console.writeln("APM: %s" % m.text, bg='red')
            mpstate.status.last_apm_msg = m.text
            mpstate.status.last_apm_msg_time = time.time()
        '''
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

    elif mtype == "SYS_STATUS":
        send_mav_msg(m)
    	'''
        battery_update(m)
        if master.flightmode != mpstate.status.flightmode and time.time() > mpstate.status.last_mode_announce + 2:
            mpstate.status.flightmode = master.flightmode
            mpstate.status.last_mode_announce = time.time()
            mpstate.rl.set_prompt(mpstate.status.flightmode + "> ")
            say("Mode " + mpstate.status.flightmode)
        '''

    elif mtype == "VFR_HUD":
    	# FIXME: this line is only here to prevent JSON problems
    	m.groundspeed = -1
        send_mav_msg(m)

    elif mtype == "GPS_RAW":
    	send_mav_msg(m)

    elif mtype == "GPS_RAW_INT":
    	send_mav_msg(m)

    elif mtype == "GLOBAL_POSITION_INT":
        send_mav_msg(m)
        #report_altitude(m.relative_alt*0.001)

    # TODO: handle NAV_CONTROLLER_OUTPUT for APM

    elif mtype in [ "COMMAND_ACK", "MISSION_ACK" ]:
    	# use this for displaying ACK in navbar
    	send_mav_msg(m)
        #mpstate.console.writeln("Got MAVLink msg: %s" % m)
    else:
        #mpstate.console.writeln("Got MAVLink msg: %s" % m)
        pass
    
    '''
    # don't pass along bad data
    if mtype != "BAD_DATA":
        # pass messages along to listeners, except for REQUEST_DATA_STREAM, which
        # would lead a conflict in stream rate setting between mavproxy and the other
        # GCS
        if mpstate.settings.mavfwd_rate or mtype != 'REQUEST_DATA_STREAM':
            for r in mpstate.mav_outputs:
                r.write(m.get_msgbuf())

        # pass to modules
        for mod in mpstate.modules:
            if not hasattr(mod, 'mavlink_packet'):
                continue
            try:
                mod.mavlink_packet(m)
            except Exception, msg:
                if mpstate.settings.moddebug == 1:
                    print(msg)
                elif mpstate.settings.moddebug > 1:
                    import traceback
                    exc_type, exc_value, exc_traceback = sys.exc_info()
                    traceback.print_exception(exc_type, exc_value, exc_traceback,
                                              limit=2, file=sys.stdout)
    '''

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



