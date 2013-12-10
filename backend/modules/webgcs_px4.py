#!/usr/bin/env python
'''
webgcs_px4.py

Author: Charles Kiorpes
Date: November 16th, 2013

Provides commands for PX4 in WebGCS
'''
import json

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


# set some default values (will be overwritten by information from the autopilot)
custom_mode = { 'main_mode' : 1, 'sub_mode' : 0 }
base_mode = 81

def name():
    '''return module name'''
    return "px4"

def description():
    '''return module description'''
    return "PX4 commands"

def custom_mode_value(sub_mode, main_mode):
    '''build the 32-bit custom_mode value from the sub and main modes'''
    return ((sub_mode << 8) | main_mode) << 16

def base_mode_value(new_custom_mode):
    '''build the 8-bit base_mode value'''
    global base_mode
    if new_custom_mode == PX4_CUSTOM_MAIN_MODE_AUTO:
        return (base_mode & ARMED_MASK | MAV_MODE_FLAG_DECODE_POSITION_STABILIZE | MAV_MODE_FLAG_DECODE_POSITION_GUIDED | MAV_MODE_FLAG_DECODE_POSITION_AUTO | MAV_MODE_FLAG_DECODE_POSITION_CUSTOM_MODE) #_0011101
    else:
        return (base_mode & ARMED_MASK | MAV_MODE_FLAG_DECODE_POSITION_MANUAL | MAV_MODE_FLAG_DECODE_POSITION_STABILIZE | MAV_MODE_FLAG_DECODE_POSITION_CUSTOM_MODE) #_1010001

def get_modes():
	return json.dumps([ 'MANUAL', 'SEATBELT', 'EASY', 'AUTO-READY', 'AUTO-TAKEOFF', 'AUTO-LOITER', 'AUTO-MISSION', 'AUTO-RTL', 'AUTO-LAND'])

def convert_command(msg):
    if msg == 'ARM':
        cmd_arm()
    elif msg == 'DISARM':
        cmd_disarm()
    elif msg == 'MANUAL':
        cmd_manual()
    elif msg == 'SEATBELT':
        cmd_seatbelt()
    elif msg == 'EASY':
        cmd_easy()
    elif msg == 'AUTO-READY':
        cmd_ready()
    elif msg == 'AUTO-TAKEOFF':
        cmd_takeoff()
    elif msg == 'AUTO-LOITER':
        cmd_loiter()
    elif msg == 'AUTO-MISSION':
        cmd_mission()
    elif msg == 'AUTO-RTL':
        cmd_rtl()
    elif msg == 'AUTO-LAND':
        cmd_land()
        
def cmd_arm():
    '''arm the PX4 (uses mavlink mode flags)'''
    global custom_mode
    global base_mode                                                                            
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode | MAV_MODE_FLAG_DECODE_POSITION_SAFETY, custom_mode_value(custom_mode['sub_mode'], custom_mode['main_mode']))
    print("Arming the PX4")

def cmd_disarm():
    '''disarm the px4'''
    global custom_mode
    global base_mode
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode & DISARM_MASK, custom_mode_value(custom_mode['sub_mode'], custom_mode['main_mode']))
    print("Disarming the PX4")

def cmd_manual():
    '''set px4 mode to MANUAL'''
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_MANUAL), custom_mode_value(0, PX4_CUSTOM_MAIN_MODE_MANUAL))
    print("Switching to MANUAL mode.")

def cmd_seatbelt():
    '''set px4 mode to SEATBELT'''
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_SEATBELT), custom_mode_value(0, PX4_CUSTOM_MAIN_MODE_SEATBELT))
    print("Switching to SEATBELT mode.")

def cmd_easy():
    '''set px4 mode to EASY'''
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_EASY), custom_mode_value(0, PX4_CUSTOM_MAIN_MODE_EASY))
    print("Switching to EASY mode.")

def cmd_ready():
    '''set px4 mode to AUTO - READY'''
    global base_mode
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_AUTO), custom_mode_value(PX4_CUSTOM_SUB_MODE_AUTO_READY, PX4_CUSTOM_MAIN_MODE_AUTO))
    print("PX4 in AUTO mode and READY")

def cmd_takeoff():
    '''switch px4 to AUTO - TAKEOFF mode'''
    global base_mode
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_AUTO), custom_mode_value(PX4_CUSTOM_SUB_MODE_AUTO_TAKEOFF, PX4_CUSTOM_MAIN_MODE_AUTO))
    print("PX4 launching in AUTO mode. -- TAKEOFF")

def cmd_loiter():
    '''switch px4 to AUTO - LOITER mode'''
    global base_mode
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_AUTO), custom_mode_value(PX4_CUSTOM_SUB_MODE_AUTO_LOITER, PX4_CUSTOM_MAIN_MODE_AUTO))
    print("PX4 switching to AUTO - LOITER mode.")

def cmd_mission():
    '''switch px4 to AUTO - MISSION mode'''
    global base_mode
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_AUTO), custom_mode_value(PX4_CUSTOM_SUB_MODE_AUTO_MISSION, PX4_CUSTOM_MAIN_MODE_AUTO))
    print("PX4 on MISSION in AUTO mode.")

def cmd_rtl():
    '''switch px4 to AUTO - RTL mode'''
    global base_mode
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_AUTO), custom_mode_value(PX4_CUSTOM_SUB_MODE_AUTO_RTL, PX4_CUSTOM_MAIN_MODE_AUTO))
    print("PX4 returning to launch in AUTO mode. -- RTL")

def cmd_land():
    '''switch px4 to AUTO - LAND mode'''
    global mpstate
    global base_mode
    server_state.mavconn.mav.set_mode_send(server_state.target_system, base_mode_value(PX4_CUSTOM_MAIN_MODE_AUTO), custom_mode_value(PX4_CUSTOM_SUB_MODE_AUTO_LAND, PX4_CUSTOM_MAIN_MODE_AUTO))
    print("PX4 LANDING in AUTO mode.")

def init(_server_state):
    global server_state
    server_state = _server_state


def mavlink_packet(m):
    # handle an incoming mavlink packet
    global custom_mode
    global base_mode
    if m.get_type() == 'HEARTBEAT':
        if custom_mode != m.custom_mode :
            custom_mode['sub_mode'] = m.custom_mode >> 24
            custom_mode['main_mode'] = (m.custom_mode >> 16) & 255
        if base_mode != m.base_mode:
            base_mode = m.base_mode


