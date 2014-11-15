/**
* Created with WebGCS.
* User: kiorpesc
* Date: 2014-11-15
* Time: 10:34 PM
* 
* Contains all MAVLink handling and decoding functionality
*/

var MAVLinkHandler = function () {
    // what goes here?
}

MAVLinkHandler.prototype.handleMavlink = function (msg, id) {
    var msg_json = JSON.parse(msg);
    var uav = uavs.getUAVById(id);
    if (id === uavs.getCurrentUAVId()) {
        if (!msg_json.hasOwnProperty('mavpackettype')){
            if(msg_json[0] === 'STATUSTEXT'){
                document.getElementById('status_text').innerHTML = msg_json[1];
            } else {
                uav.setFlightModes(msg_json);
                updateModeButtons(current_uav);
            }
        }else{
            switch(msg_json.mavpackettype)
            {
                case 'VFR_HUD':
                    document.getElementById('alt').innerHTML = msg_json.alt.toFixed(3);
                    document.getElementById('heading').innerHTML = msg_json.heading.toFixed(1);
                    break;
                case 'ATTITUDE':
                    uavs[current_uav].pitch = msg_json.pitch;
                    uavs[current_uav].roll = msg_json.roll;
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
                case 'SYS_STATUS':
                    uavs[current_uav].voltage = msg_json.voltage_battery/1000;  //voltage comes in as milliVolts
                    document.getElementById('airspeed').innerHTML = uavs[current_uav].voltage.toFixed(3) + "V";
                    break;
                case 'STATUSTEXT':
                    document.getElementById('status_text').innerHTML = msg_json.text;
                    throw new Error(msg_json.text);
                    break;
                default:
                    //throw new Error(msg);
                    break;
            }
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
    //debug_counter += 1;
}

// TODO: actually decode something
MAVLinkHandler.prototype.decodePX4FlightMode = function (uav){
  var flight_mode = "MANUAL";
  uav.flight_mode_string = flight_mode;
}