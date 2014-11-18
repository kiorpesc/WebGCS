var last_lat = 0.0;
var last_lon = 0.0;
var intervalID;
var uavs = new UAVList();
// var debug_counter = 0;
var handler = new MAVLinkHandler();



/*
// "class" to hold state of a single UAV
function UAV(ws, address, port, id) {
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
*/

/** Create a new UAV connection with WebSockets,
 *  and add the UAV to the navbar.
 */
function newUAVLink(ip_port_string){
  var ip_port = ip_port_string.split(":");
  var ws = new WebSocket("ws://" + ip_port_string + "/websocket");

  // on websocket open, link the new websocket to a new UAV
  // and switch our focus to the new UAV
  ws.onopen = function() {
    var id = window.uavs.length;
    if (ip_port.length > 1){
      window.uavs[id] = new UAV(ws, ip_port[0], ip_port[1], id);
    }
    else {
      window.uavs[id] = new UAV(ws, ip_port[0], 80, id);
    }
    window.current_uav = id;
    addUAVTabById(id);
    // alert('Connected. uav id=' + id.toString());
  }

  // process received messages
  ws.onmessage = function(evt){
    var msg = evt.data;
    var ws_id = getWSId(ws);
    handler.handleMavlink(msg, ws_id);
  }

  // what if there is an error?
  // TODO: stop using alerts and confirmation windows
  ws.onerror = function() {
    var ws_id = getWSId(ws);
    if(confirm("UAV " + ws_id.toString() + " connection error. Attempt reconnect?")){
      reconnectUAV(ws_id);
    }
    else {
      removeUAVById(ws_id);
      alert("UAV " + ws_id.toString() + " removed.");
      ws.close();
    }
  }

  // TODO: handle closing the link?
  ws.onclose = function() {
    var ws_id = getWSId(ws);
  }
} // end newUAVLink


/* Attempt to reestablish communications with a UAV. */
// FIXME: currently causes issues - also is essentially the same code as above.
function reconnectUAV(id) {
  uavs[id].ws.close();
  var ws = new WebSocket("ws://" + window.uavs[id].address + ":" + window.uavs[id].port + "/websocket");

  ws.onopen = function() {
    var id = uavs.length;
    window.uavs.socket = ws;
    // window.current_uav = id;
    // alert('Connection established.');
  }
  ws.onmessage = function(evt){
    var msg = evt.data;
    var ws_id = getWSId(ws);
    if (ws_id === -1){
      throw new Error('ws_id is not correct');
    }
    HandleMavlink(msg, ws_id);
  }

  ws.onerror = function() {
    var ws_id = getWSId(ws);
    if(confirm("UAV " + ws_id.toString() + " connection error. Attempt reconnect?")){
      //close and reopen web socket
    }
    else {
      removeUAVById(ws_id);
      alert("UAV " + ws_id.toString() + " removed.");
    }
  }

  ws.onclose = function() {
    var ws_id = getWSId(ws);
    alert("Connection with UAV " + ws_id.toString() + "closed.");
  }
} // end reconnectUAV

// rudimentary linear search through UAVs for the current one
function getWSId(ws){
  for(var i = 0; i < window.uavs.length; i++){
    if (ws === window.uavs[i].socket){
      return window.uavs[i].id;
    }
  }
    return -1;
}

// send a command to the UAV server
function sendCommand(cmd_string){
  var command = cmd_string
  if(cmd_string === 'ARM'){
    if(uavs[current_uav].armed){
        command = 'DISARM';
    }
  }
  uavs[current_uav].socket.send(command);
}

// add a new tab to the interface when a new UAV connection is established
function addUAVTabById(id){
  var container= document.getElementById('current_uavs_ul');
  var child = document.createElement("li");
  child.setAttribute("class","active");
  child.setAttribute("id", "uav" + id.toString());
  var child_html = '<a href="#">UAV ' + id.toString();
  child_html += "  <span class=\"badge\" id=\"uav" + id.toString() + "_badge\">";
  child_html += "NO MODE</span></a>";
  child.innerHTML = child_html;
  //parents[i].insertBefore(child, parents[i].firstChild);
  container.appendChild(child);

  // make other tabs inactive
  if(window.uavs.length > 1){
    for(var i = 0; i < id; i++){
      document.getElementById("uav" + i.toString()).setAttribute("class", "");
    }
  }

  setTimeout(function(){ centerMap(); }, 1000);

}

// FIXME: currently does not check to see if there are actually any UAVs
// before attempting a delete
function removeUAVById(id){
  var container= document.getElementById('current_uavs_ul');
  var child = document.getElementById('uav' + id.toString())
  container.removeChild(child);
  window.uavs[id].socket.close();
  window.uavs.splice(id, 1);
  //update current uav number and highlight
  if(window.uavs.length === 0){
    current_uav = -1;
  } else {
    updateUAVIds();
    current_uav = 0;
    document.getElementById("uav0").setAttribute("class", "active");
    updateModeButtons(current_uav);
  }
}

// when a UAV is removed that is not the last in the list,
// the id numbers need to be updated to reflect the new array positions.
function updateUAVIds(){
  if (window.uavs[window.uavs.length-1].id >= window.uavs.length){
    for(var i = 0; i < window.uavs.length; i++){
      window.uavs[i].id = i;
    }
  }
}

// gets the available flight modes from the current UAV
// and updates the options available on the interface
function updateModeButtons(id){
  if(uavs.getCurrentUAVId() != -1){
    var modes_div = document.getElementById('flight_modes');
    modes_div.innerHTML = '';
    var uav = uavs.getUAVById(id);
    var modes = uav.getFlightModes();
    for(var i = 0; i < modes.length; i++){
      var mode = modes[i];
      var command = "uavs.getCurrentUAV().sendCommand('" + mode + "');";
      var link = document.createElement("a");
      link.setAttribute('href', '#');
      link.setAttribute('class', 'list-group-item');
      link.setAttribute('onclick', command);
      link.innerHTML = mode;
      modes_div.appendChild(link);
    }
  }
}


function pulseUAV(uav){
  // update UI and data elements based on current heartbeat data
  // check armed state
  uav.armed = ((uav.base_mode & 128) >> 7 === 1)
  // check flight mode
  if (uav.autopilot === 12){
    handler.decodePX4FlightMode(uav);
  } /*else {
    decodeArdupilotFlightMode(uav);
  }*/
  updateUIFlightMode(uav);
}

// UI stuff, changes badge color if UAV is armed
function brightenBadge(badge, armed){
  if(armed){
    var color = "#33cc33";
  }
  else {
    var color = "#BB3333";
  }

  badge.style.background = color;
  setTimeout(function () { dimBadge(badge, armed); }, 400);
}

// UI stuff
function dimBadge(badge, armed){
  if(armed){
    var color = "#009900";
  } else {
    var color = "#992222";
  }

  badge.style.background = color;
}



// updates the flight mode on the UI
function updateUIFlightMode(uav){
  armed_badge = document.getElementById("current_armed");
  uav_badge = document.getElementById("uav" + uav.id.toString() + "_badge");
  if(uav.armed){
    var output = "A|";
    armed_badge.innerHTML = "ARMED";
  } else {
    var output = "D|";
    document.getElementById("current_armed").innerHTML = "DISARMED";
  }


  output += uav.flight_mode_string;
  uav_badge.innerHTML = output;
  brightenBadge(uav_badge, uav.armed);

  if(uav.id === window.current_uav){
    document.getElementById("current_mode_badge").innerHTML = uav.flight_mode_string;
  }
}

// utility to dynamically load files
function loadjscssfile(filename, filetype){
 if (filetype=="js"){ //if filename is a external JavaScript file
  var fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", filename)
 }
 else if (filetype=="css"){ //if filename is an external CSS file
  var fileref=document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", filename)
 }
 if (typeof fileref!="undefined")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}
