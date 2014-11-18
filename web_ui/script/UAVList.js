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

UAVList.prototype.getNumUAVs = function () {
    return this.uavs.length;
}

UAVList.prototype.setCurrentUAV = function(id) {
    this.current_uav = id;
}

UAVList.prototype.addUAV = function(ws) {
    var id = this.uavs.length;
    this.uavs[id] = new UAV(ws, id);
    this.setCurrentUAV(id);
    console.log(id);
    console.log(uavs);
}

UAVList.prototype.addUAVLink = function (ip_port_string) {
    var ws;
    var ip_port = ip_port_string.split(":");
    var full_address = "ws://" + ip_port_string;
    
    
    if (ip_port_string !== "sw-testing"){
        full_address += "/websocket";
        ws = new WebSocket(full_address);
    } else {
        ws = new WebMocket(full_address);
    }
    this.setUpWebSocket(ws, this);
    
    if(ip_port_string === "sw-testing") {
        ws.onopen();
        setInterval(ws.generateHeartbeat, 1000);
    }
}

UAVList.prototype.setUpWebSocket = function (ws, uavlist) {
    // on websocket open, link the new socket to a new UAV
    // and switch focus to the new UAV
    ws.onopen = function () {
        uavlist.addUAV(ws);
        
        // TODO: put UI functions inside of UI Namespace?
        addUAVTabById(uavlist.getCurrentUAVId());
        
        // attach an id to the ws
        ws.UAVid = uavlist.getCurrentUAVId();

        console.log("Added new UAV; id = ");
        console.log(ws.UAVid);

    }
    
    // process received messages
    ws.onmessage = function(evt) {
        var msg = evt.data;
        var ws_id = ws.UAVid;   // might not be needed
        
        // TODO: Mavlink handling in own class
        handler.handleMavlink(msg, ws_id);
    }
    
    // handle socket errors
    ws.onerror = function () {
        var ws_id = ws.UAVid;
        
        if(confirm("UAV " + ws_id.toString() + " connection error.  Attempt reconnect?")){
            // reconnect
        } else {
            // remove UAV from UI
            removeUAVById(ws_id);
            ws.close();
        }   
    }
    
    // websocket close
    ws.onclose = function () {
        var ws_id = ws.UAVid;
        alert("Connection with UAV " + ws_id.toString() + "closed.");
    }
}

