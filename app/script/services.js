'use strict';

var WebGCSServices = angular.module('WebGCSServices', ['ngResource']);

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
      if(msg_json[0] === 'STATUSTEXT'){
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


WebGCSServices.factory('UAVFactory', ['MAVLinkService', 'MyWebSocketFactory', function(MAVLinkService,$websocket) {

  function UAV(){
    this.socket = null;
    this.id = null;
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
    };
    this.flight_modes = [];
  }

  UAV.prototype.connect = function(_url, id) {
    var retval = false;
    var ws_config = {
      url : _url,
      reconnect : false,
    };

    if (_url === "sw-testing") {
      ws_config.mock = true;
      ws_config.reconnect = true;
      retval = true;
    }

    var ws = $websocket(_url);

    this.setUpSocket(ws, id);

    this.socket = ws;
    this.id = id;

    return retval;
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
    var _flight_modes = this.flight_modes;
    var _params = this.params;
    var response = MAVLinkService.handleMAVLink(msg);

    if (response.hasOwnProperty('flight_modes')) {
      console.log("setting flight modes");
      _flight_modes = response.flight_modes;
    }
    if (response.hasOwnProperty('params')){
      console.log("setting params");
      for (var key in response.params){
        if (_params.hasOwnProperty(key)){
          _params[key] = response.params[key];
        }
      }
    }
    this.flight_modes = _flight_modes;
    this.params = _params;
  }

  UAV.prototype.setUpSocket = function(ws, id){
    var the_uav = this;
    ws.onopen = function () {
      console.log("websocket opened.");
    }
    ws.onerror = function() {
      console.log('WEBSOCKET ERROR hit');
      window.alert("Connection to websocket encountered an error.");
    }
    ws.onmessage = function(evt) {
      var msg = evt.data;
      var ws_id = ws.UAVid;   // might not be needed

      the_uav.handleMessage(msg);
    }
    ws.onclose = function() {
      var ws_id = ws.UAVid;
    };

    if(ws.url === 'sw-testing'){
      ws.sendFlightModes();
    }
  }

  return function() {
    return new UAV();
  };
}]);

/**
 * Custom WebSocket factory to allow unit testing
 *   and generation of message events without a
 *   server.
 **/
WebGCSServices.factory('MyWebSocketFactory', function(){
  var MyWebSocket = function(_url){
    this.url = _url;
    this.heartbeat = {
        mavpackettype : 'HEARTBEAT',
        autopilot : 12,
        system_state : 3,    // 3 is standby, 4 is active
        base_mode : 0,
        custom_mode : 0,
    };
    this.flight_modes = ['MANUAL',
                         'SEATBELT',
                         'EASY',
                         'AUTO-READY',
                         'AUTO-TAKEOFF',
                         'AUTO-LOITER',
                         'AUTO-MISSION',
                         'AUTO-RTL',
                         'AUTO-LAND'];
    this.vfr_hud = {
        mavpackettype: 'VFR_HUD',
        alt:    100.0,      // 100 m
        heading: 5.00,      // 5 degrees
    };
    this.sys_status = {
        voltage: 12000,     // 12V
    };
    this.statustext = {
        text: "Status message.",
    };
  }

  MyWebSocket.prototype.onopen = function () {

  }

  MyWebSocket.prototype.onmessage = function (msg) {

  }

  MyWebSocket.prototype.onerror = function () {

  }

  MyWebSocket.prototype.onclose = function () {

  }

  MyWebSocket.prototype.dispatchEvent = function (e) {
      this.onmessage(e);
  }

  MyWebSocket.prototype.send = function (msg) {
      console.log(msg);
  }

  MyWebSocket.prototype.close = function() {
      self.onclose();
  }

  MyWebSocket.prototype.wrapEvent = function (contents) {
      var data_str = JSON.stringify(contents);
      return new MessageEvent("message", {
          data: data_str,
      });
  }

  MyWebSocket.prototype.sendFlightModes = function () {
      var msg_evt = this.wrapEvent(this.flight_modes);
      this.dispatchEvent(msg_evt);
  }

  MyWebSocket.prototype.generateVFR_HUD = function () {

  }

  MyWebSocket.prototype.generateHeartbeat = function () {
      console.log("Generating lub dub");
      var msg_evt = this.wrapEvent(this.heartbeat);
      this.dispatchEvent(msg_evt);
  }

  MyWebSocket.prototype.beginTransmitting = function () {
      this.sendFlightModes();

  }

  return function(url) {
      if (url === "sw-testing"){
        return new MyWebSocket(url);
      } else {
        return new WebSocket(url);
      }
  }
})
