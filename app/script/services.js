'use strict';

var WebGCSServices = angular.module('WebGCSServices', ['ngResource']);

WebGCSServices.service('MAVLinkService', function() {
  this.message_count = 0;
  this.handleMAVLink = function(msg, id) {
    var msg_json = JSON.parse(msg);
    console.log("IN MAVLINKHANDLER");
    console.log(uavs);

    var response = {
      params : {},
      flight_modes : [],
    }

    if(!msg_json.hasOwnProperty('mavpackettype')){
      if(msg_json[0] == 'STATUSTEXT'){
        // display on screen
      } else {
        response.flight_modes = msg_json;
      }
    } else {
      switch(msg_json.mavpackettype)
      {
          case 'VFR_HUD':
            response.params.alt = msg_json.alt;
            response.params.heading = msg_json.heading;
            break;
          case 'ATTITUDE':
            response.params.pitch = msg_json.pitch;
            response.params.roll = msg_json.roll;
            break;
          case 'GPS_RAW_INT':
            response.params.lat = msg_json.lat/10000000;
            response.params.lon = msg_json.lon/10000000;
            break;
          case 'SYS_STATUS':
            response.params.voltage = msg_json.voltage_battery/1000;
            break;
          case 'STATUSTEXT':
            // update UI somehow.
            //document.getElementById('status_text').innerHTML = msg_json.text;
            throw new Error(msg_json.text);
            break;
          default:
            //throw new Error(msg);
            break;
      }
    }

    // heartbeat is always processed.
    if (msg_json.mavpackettype === 'HEARTBEAT'){
        //uav.setBaseMode(msg_json.base_mode);
        response.params.base_mode = msg_json.base_mode;
        //uav.setCustomMode(msg_json.custom_mode);
        response.params.custom_mode = msg_json.custom_mode;
        //uav.setSystemState(msg_json.system_state);
        response.params.system_state = msg_json.system_state;
        //uav.setAutopilot(msg_json.autopilot);
        respone.params.autopilot = msg_json.autopilot;
        /* UI Stuff
        updateUIFlightMode(uav);
        pulseUAV(uav);
        */
    }
    return response;
  }
});

// a factory might not really be needed here -- violates YAGNI
WebGCSServices.factory('UAVFactory', function() {
  function UAV(){
    this.socket = null,
    this.id = null,
    this.params = {
      last_heartbeat : 0,
      base_mode : 0,
      custom_mode : 0,
      flight_mode_string : "",
      system_state : 0,
      armed : false,
      pitch : 0,
      roll : 0,
      yaw : 0,
      lat : 0,
      lon : 0,
      alt : 0,
      heading: 0,
      airspeed : 0,
      autopilot : 0,
      voltage : 0,
    },
    this.flight_modes = []
  }
  UAV.prototype.connect = function(ws, id) {
      this.socket = ws;
      this.id = id;
  };
  UAV.prototype.isArmed = function() {
      return this.params.armed;
    };
  UAV.prototype.sendCommand = function(cmd_str) {
      this.socket.send(cmd_str);
  };
  UAV.prototype.arm = function() {
      this.sendCommand('ARM');
  };
  UAV.prototype.disarm = function() {
      this.sendCommand('DISARM');
  };

  UAV.prototype.handleMessage = MAVLinkService.handleMAVLink;

  return UAV;
});
