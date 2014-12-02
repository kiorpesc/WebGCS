/**
* Created with WebGCS.
* User: kiorpesc
* Date: 2014-11-17
* Time: 03:09 PM
*
* A fake websocket to be used for testing front-end functionality
*   without the need for a functioning backend
*/

function WebMocket (addr) {
    this.url = addr;
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

    //setTimeout(this.generateHeartbeat, 1000);
}

WebMocket.prototype.onopen = function () {

}

WebMocket.prototype.onmessage = function (msg) {

}

WebMocket.prototype.onerror = function () {

}

WebMocket.prototype.onclose = function () {

}

WebMocket.prototype.dispatchEvent = function (e) {
    this.onmessage(e);
}

WebMocket.prototype.send = function (msg) {
    console.log(msg);
}

WebMocket.prototype.close = function() {
    self.onclose();
}

WebMocket.prototype.wrapEvent = function (contents) {
    var data_str = JSON.stringify(contents);
    return new MessageEvent("message", {
        data: data_str,
    });
}

WebMocket.prototype.sendFlightModes = function () {
    var msg_evt = this.wrapEvent(this.flight_modes);
    this.dispatchEvent(msg_evt);
}

WebMocket.prototype.generateVFR_HUD = function () {

}

WebMocket.prototype.generateHeartbeat = function () {
    console.log("Generating lub dub");
    //var data_str = JSON.stringify(this.heartbeat);
    //var msg_evt = new MessageEvent("message", {
    //    data : data_str,
    //});

    var msg_evt = this.wrapEvent(this.heartbeat);
    this.dispatchEvent(msg_evt);
}

WebMocket.prototype.beginTransmitting = function () {
    this.sendFlightModes();
    //setInterval(this.generateHeartbeat, 1000);
}
