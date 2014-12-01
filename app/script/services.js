'use strict';

var WebGCSServices = angular.module('WebGCSServices', ['ngResource','ngWebsocket']);

WebGCSServices.service('MAVLinkService', function() {
  this.message_count = 0;
  this.handleMAVLink = function(msg, id) {
    // ugly but effective try/catch for non-JSON strings
    try{
      var msg_json = JSON.parse(msg);
    } catch (e){
      return "";
    }

    var response = {};

    if(!msg_json.hasOwnProperty('mavpackettype')){
      if(msg_json[0] == 'STATUSTEXT'){
        // display on screen
      } else {
        response.flight_modes = msg_json;
      }
    } else {
      response.params = {};
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
            throw new Error(msg_json.text);
            break;
          default:
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
        response.params.autopilot = msg_json.autopilot;
        /* UI Stuff
        updateUIFlightMode(uav);
        pulseUAV(uav);
        */
    }
    return response;
  }
  this.translateFlightMode = function(base, custom) {
    //put translation code here
  };
});


WebGCSServices.factory('UAVFactory', ['MAVLinkService', '$websocket', function(MAVLinkService,$websocket) {
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
  UAV.prototype.connect = function(_url, id) {
    var ws_config = {
      url : _url,
    };

    if (_url === "sw-testing") {
      ws_config.mock = true;
    }

    var ws = $websocket.$new(ws_config);

    this.setUpSocket(ws, id);

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
  UAV.prototype.handleMessage = function(msg) {
    var response = MAVLinkService.handleMAVLink(msg);
    if (response.hasOwnProperty('flight_modes')) {
      this.flight_modes = response.flight_modes;
    }
    if (response.hasOwnProperty('params')){
      for (var param in response.params){
        this[param] = response[param];
      }
    }
  }

  UAV.prototype.setUpSocket = function(ws, id){
    ws.$on('$open', function () {
      console.log("ws on open triggered.");
      // attach an id to the ws
      ws.UAVid = id;
    })
    .$on('$error', function() {
      var ws_id = ws.UAVid;

      if(confirm("UAV " + ws_id.toString() + " connection error.  Attempt reconnect?")){
        // reconnect
      } else {
        // remove UAV from UI
        //removeUAVById(ws_id);
        //ws.close();
      }
    })
    .$on('$message', function(evt) {
      var msg = evt.data;
      var ws_id = ws.UAVid;   // might not be needed

      var response = this.handleMessage(msg);
      //TODO: parse response into appropriate locations
    })
    .$on('$close', function() {
      var ws_id = ws.UAVid;
      alert("Connection with UAV " + ws_id.toString() + "closed.");
    });
  }

  return function() {
    return new UAV();
  };
}]);
