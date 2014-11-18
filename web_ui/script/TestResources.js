/**
* Created with WebGCS.
* User: kiorpesc
* Date: 2014-11-18
* Time: 03:38 PM
* To change this template use Tools | Templates.
*/

var Mocks = function (ws) {
    this.socket = ws;
    this.heartbeat = {
        mavpackettype : 'HEARTBEAT',
        autopilot : 12,
        system_state : 3,    // 3 is standby, 4 is active
        base_mode : 0,
        custom_mode : 0,
    };
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

Mocks.prototype.generateHeartbeat = function () {
    this.socket.dispatchevent(new MessageEvent( "message", {
        data: this.heartbeat
    }));
    
    setTimeout(generateHeartbeat, 1000);
}