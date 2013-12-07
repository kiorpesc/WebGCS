var last_lat = 0.0;
var last_lon = 0.0;
var intervalID;
var uavs = new Array();
var debug_counter = 0;
var current_uav = -1;

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

} 

/** Create a new UAV connection with WebSockets,
 *  and add the UAV to the navbar.
 */
function newUAVLink(ip_port_string){
  var ip_port = ip_port_string.split(":");
  var ws = new WebSocket("ws://" + ip_port_string + "/websocket");
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
    alert('Connected. uav id=' + id.toString());
  }
  ws.onmessage = function(evt){
    var msg = evt.data;
    var ws_id = getWSId(ws);
    HandleMavlink(msg, ws_id);
  }

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

  ws.onclose = function() {
    var ws_id = getWSId(ws);
  }
} // end newUAVLink


/** Attempt to reestablish communications with a UAV. */
function reconnectUAV(id) {
  uavs[id].ws.close();
  var ws = new WebSocket("ws://" + window.uavs[id].address + ":" + window.uavs[id].port + "/websocket");
  ws.onopen = function() {
    var id = uavs.length;
    window.uavs.socket = ws;
    // window.current_uav = id;
    alert('Connection established.');
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

function getWSId(ws){
  for(var i = 0; i < window.uavs.length; i++){
    if (ws === window.uavs[i].socket){
      return window.uavs[i].id;
    }
  }
    return -1;
}

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

}

function removeUAVById(id){
  var container= document.getElementById('current_uavs');
  container.removeChild('uav' + id.toString());
  window.uavs[id].socket.close();
  window.uavs.splice(id, 1);
  updateUAVIds();
  //update current uav number and highlight
  if(window.uavs.length === 0){
    current_uav = -1;
  } else {
    current_uav = 0;
    document.getElementById("uav0").setAttribute("class", "active");
  }
}

function updateUAVIds(){
  if (window.uavs[window.uavs.length-1].id >= window.uavs.length){
    for(var i = 0; i < window.uavs.length; i++){
      window.uavs[i].id = i;
    }
  }
}

/*
function DispatchText(){
  //first, get message from input field
  var userInput = document.getElementById("message").value;
  //then, clear input field
  document.getElementById("message").value = "";
  //now, create a paragraph element
  x = document.createElement("p");
  //set the p text to the input 
  x.innerHTML = "You sent: " + userInput;
  //stick the input into the chat box
  document.getElementById("chatbox").appendChild(x);
  //send user input to server for processing
  ws.send(userInput);
}
*/


function HandleMavlink(msg, id){
  var msg_json = JSON.parse(msg);
  var uav = window.uavs[id];
  if (id === window.current_uav) {
  switch(msg_json.mavpackettype)
  {
    case 'VFR_HUD':
      document.getElementById('alt').innerHTML = msg_json.alt.toFixed(3);
      document.getElementById('heading').innerHTML = msg_json.heading.toFixed(1);
      break;
    case 'ATTITUDE':
      //document.getElementById('pitch').innerHTML = msg_json.pitch.toFixed(6);
      //document.getElementById('roll').innerHTML = msg_json.roll.toFixed(6);
      break;
    case 'GPS_RAW_INT':
      window.uavs[window.current_uav].lat = msg_json.lat/10000000;
      document.getElementById('lat').innerHTML = window.uavs[window.current_uav].lat.toFixed(7);
      window.uavs[window.current_uav].lon = msg_json.lon/10000000;
      document.getElementById('lon').innerHTML = window.uavs[window.current_uav].lon.toFixed(7);
      //document.getElementById('time_sec').innerHTML = (msg_json.time_usec/1000000).toFixed(4);
      break;
    default:
      break;    
  }
  }

  // heartbeat is always processed.
  if (msg_json.mavpackettype === 'HEARTBEAT'){
      uav.base_mode = msg_json.base_mode;
      uav.custom_mode = msg_json.custom_mode;
      uav.system_state = msg_json.system_state;
      uav.autopilot = msg_json.autopilot;
      pulseUAV(uav);
  }
}

function pulseUAV(uav){
  // update UI and data elements based on current heartbeat data
  // check armed state
  uav.armed = ((uav.base_mode & 128) >> 7 === 1)
  // check flight mode
  if (uav.autopilot === 12){
    decodePX4FlightMode(uav);
  } /*else {
    decodeArdupilotFlightMode(uav);
  }*/
  updateUIFlightMode(uav);
}

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

function dimBadge(badge, armed){
  if(armed){
    var color = "#009900";
  } else {
    var color = "#992222";
  }

  badge.style.background = color;
}

function decodePX4FlightMode(uav){
  var flight_mode = "MANUAL";
  uav.flight_mode_string = flight_mode;
}

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

