/**
* Created with WebGCS.
* User: kiorpesc
* Date: 2014-11-15
* Time: 08:03 PM
* 
* Object to keep track of all the UAVs
*/

var UAVList = function () {
    this.uavs = new Array();
    this.current_uav = -1;
    
}

UAVList.prototype.getUAVById = function(id) {
    return this.uavs[id];
}

UAVList.prototype.getIdByWs = function(ws) {
    for(var i = 0; i < this.uavs.length; i++){
        if (ws === this.uavs[i].socket){
            return this.uavs[i].id;
        }
    }
    return -1;
}

UAVList.prototype.getUAVByWs = function(ws) {
    var id = this.getIdByWs(ws);
    if (id >= 0) {
        return uavs[id];
    } else {
        // how to handle no object?
    }
}

UAVList.prototype.getCurrentUAVId = function () {
    return this.current_uav;
}

UAVList.prototype.getCurrentUAV = function () {
    return this.uavs[this.current_uav];
}

UAVList.prototype.addUAVLink = function (ip_port_string) {
    var ip_port = ip_port_string.split(":");
    var ws = new WebSocket("ws://" + ip_port_string + "/websocket");

    // on websocket open, link the new socket to a new UAV
    // and switch focus to the new UAV
    ws.onopen = function () {
        var id = this.uavs.length;  // will "this" work here?
        if (ip_port.length < 2) {
            ip_port[1] = "80";
        }
        this.uavs[id] = new UAV(ws, ip_port[0], ip_port[1], id);
        this.current_uav = id;
        
        // TODO: put UI functions inside of UI Namespace?
        addUAVTabById(id);
        
        // attach an id to the ws
        ws.UAVid = id;
    }
    
    // process received messages
    ws.onmessage = function(evt) {
        var msg = evt.data;
        var ws_id = ws.UAVid;   // might not be needed
        
        // TODO: Mavlink handling in own class
        HandleMavlink(msg, ws_id);
    }
    
    // handle socket errors
    ws.onerror = function () {
        var ws_id = ws.UAVid;
        
        if(confirm("UAV " + ws_id.toString() + " connection error.  Attempt reconnect?")){
            // reconnect
        } else {
            // remove UAV from UI
            ws.close();
        }   
    }
    
    // websocket close
    ws.onclose = function () {
        var ws_id = ws.UAVid;
        alert("Connection with UAV " + ws_id.toString() + "closed.");
    }
}
