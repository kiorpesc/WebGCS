var last_lat = 0.0;
var last_lon = 0.0;
var intervalID;
var uavs = new UAVList();
// var debug_counter = 0;
var handler = new MAVLinkHandler();

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
  uavs.getUAVById(id).getSocket().close();
  window.uavs.splice(id, 1);  // ?
  //update current uav number and highlight
  if(uavs.getNumUAVs() === 0){
    uavs.setCurrentUAV(-1);
  } else {
    updateUAVIds();
    uavs.setCurrentUAV(0);
    document.getElementById("uav0").setAttribute("class", "active");
    updateModeButtons(uavs.getCurrentUAVId());
  }
}

// TODO: put this inside of UAVList
// when a UAV is removed that is not the last in the list,
// the id numbers need to be updated to reflect the new array positions.
function updateUAVIds(){
  if (window.uavs[window.uavs.length-1].id >= window.uavs.length){
    for(var i = 0; i < window.uavs.length; i++){
      window.uavs[i].id = i;
    }
  }
}

// UI
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

// UI
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
