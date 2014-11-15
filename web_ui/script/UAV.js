/**
* File: UAV.js
* User: kiorpesc
* Date: 2014-11-15
* Time: 04:19 PM
*
* Contains the UAV class and its member methods.
*/

// "class" to hold state of a single UAV
var UAV = function (ws, address, port, id) {
  this.socket = ws;
  this.address = address;
  this.port = port;
  this.id = id;
  this.last_heartbeat = 0;
  this.base_mode = 0;
  this.custom_mode = 0;
  this.flight_mode_string = ""
  this.system_state = 0;
  this.armed = false;
  this.pitch = 0;
  this.roll = 0;
  this.yaw = 0;
  this.lat = 0;
  this.lon = 0;
  this.alt = 0;
  this.airspeed = 0;
  this.autopilot = 0;
  this.voltage = 0;
  this.flight_modes = [];
}

UAV.prototype.getPitch = function () {
    return this.pitch;
}

UAV.prototype.getRoll = function () {
    return this.roll;
}

UAV.prototype.getYaw = function () {
    return this.yaw;
}

UAV.prototype.getLatitude = function () {
    return this.lat;
}

UAV.prototype.getLongitude = function () {
    return this.lon;
}

UAV.prototype.getAltitude = function () {
    return this.alt;
}

UAV.prototype.getAirspeed = function () {
    return this.airspeed;
}

UAV.prototype.getVoltage = function () {
    return this.voltage;
}

UAV.prototype.getFlightModes = function () {
    return this.flight_modes;
}

UAV.prototype.isArmed = function () {
    return this.armed;
}

UAV.prototype.sendCommand = function (cmd_string) {
    this.socket.send(cmd_string);
}

// arm the UAV
// we do not set the class variable here,
// because its state depends on MavLink
// messages (what if arm fails?)
UAV.prototype.arm = function () {
    this.sendCommand('ARM');    
}

// disarm the UAV
UAV.prototype.disarm = function() {
    this.sendCommand('DISARM');
}
