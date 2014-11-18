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

UAVList.prototype.addUAV = function(ws, address, port) {
    var id = this.uavs.length;
    this.uavs[id] = new UAV(ws, address, port, id);
    this.setCurrentUAV(id);
}

UAVList.prototype.addUAVLink = function (ip_port_string) {
    var ws;
    var ip_port = ip_port_string.split(":");
    
    ws = new WebSocket("ws://" + ip_port_string + "/websocket");
    this.setUpWebSocket(ws);
    
    if (ip_port_string === "sw-testing"){
        loadjscssfile('TestResources.js', 'js');
        this.testResources = new TestResources(ws);
        this.testResources.generateHeartbeat();
    }
}

UAVList.prototype.setUpWebSocket = function (ws) {
    // on websocket open, link the new socket to a new UAV
    // and switch focus to the new UAV
    ws.onopen = function () {
        if (ip_port.length < 2) {
            ip_port[1] = "80";
        }
        uavs.addUAV(ws, ip_port[0], ip_port[1]);
        
        // TODO: put UI functions inside of UI Namespace?
        addUAVTabById(uavs.getCurrentUAVId());
        
        // attach an id to the ws
        ws.UAVid = uavs.getCurrentUAVId();

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

