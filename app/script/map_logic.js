// All Google Maps logic should be contained here


var map        //the google map itself
var marker     //the first marker

// initialize the map at some coordinates (currently Pittsburgh)
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

var getCurrentLatLng = function () {
    return new google.maps.LatLng(uavs.getCurrentUAV().getLatitude(), uavs.getCurrentUAV().getLongitude());
}

// update the position of the marker every two seconds based on the current UAV
var updatePosition = function(){
  window.debug_counter += 1;
  if (uavs.getCurrentUAVId() !== -1){
    var currentLoc = getCurrentLatLng();
    marker.setPosition(currentLoc);
  }
  setTimeout(function(){ updatePosition(); }, 2000);
}

// center the map - this is called one second after a new UAV is added,
// when focus moves to a different UAV,
// or when the user clicks the "Center Map" link on the left
var centerMap = function(){
    if (uavs.getCurrentUAVId() != -1){
        var currentLoc = getCurrentLatLng();
        map.panTo(currentLoc);
    }
}

//google.maps.event.addDomListener(window, 'load', initializeMap);
