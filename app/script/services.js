'use strict';

var WebGCSServices = angular.module('WebGCSServices', ['ngResource']);

WebGCSServices.factory('UAVFactory', function() {
  var uav = {
    socket : null,
    id : null,
    params : {
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
    flight_modes : [],
    connect : function(ws, id) {
      this.socket = ws;
      this.id = id;
    },
    isArmed : function() {
      return this.params.armed;
    },
    sendCommand : function(cmd_str) {
      this.socket.send(cmd_str);
    },
    arm : function() {
      this.sendCommand('ARM');
    },
    disarm : function() {
      this.sendCommand('DISARM');
    },
  };
  return uav;
});
