// All Google Maps logic should be contained here

var map
var marker
function initializeMap() {
  var map_canvas = document.getElementById('map_canvas');
  var map_options = {
    center: new google.maps.LatLng(40.44791, -79.93422),
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.SATELLITE
  }
  map = new google.maps.Map(map_canvas, map_options)
  map.setTilt(0)

  marker = new google.maps.Marker({
    position: map.getCenter(),
    map: map,
    title: 'PX4'
  });

  updatePosition();
}
 
var updatePosition = function(){
  window.debug_counter += 1;
  if (current_uav !== -1){
    marker.setPosition(new google.maps.LatLng(window.uavs[window.current_uav].lat, window.uavs[window.current_uav].lon));
    //document.getElementById('lastlat').innerHTML = window.last_lat.toString();
    //document.getElementById('airspeed').innerHTML = window.debug_counter.toString();
  }
  setTimeout(function(){ updatePosition(); }, 2000);
}


google.maps.event.addDomListener(window, 'load', initializeMap);
//window.onload.initializeMap();