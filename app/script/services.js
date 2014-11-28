'use strict';

var WebGCSServices = angular.module('WebGCSServices', ['ngResource']);

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
  return UAV;
});
