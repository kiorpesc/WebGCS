'use strict';

var WebGCSControllers = angular.module('WebGCSControllers', ['ngMap','ngWebsocket']);

WebGCSControllers.controller('UAVListCtrl', ['$scope', 'UAVFactory','$websocket', function($scope, UAVFactory,$websocket){
    $scope.$websocket = $websocket;
    $scope.uavs = [];

    $scope.current_uav_id = -1;
    $scope.current_url = "";

    $scope.isActiveUAV = function(id) {
      return id === $scope.current_uav_id;
    }

    $scope.getUAVById = function(id) {
      if ($scope.current_uav_id !== -1){
        return $scope.uavs[id];
      } else {
        return null;
      }
    };

    $scope.getIdByWs = function(ws) {
      for(var i = 0; i < $scope.uavs.length; i++){
        if (ws === $scope.uavs[i].socket){
          return $scope.uavs[i].id;
        }
      }
      return -1;
    };

    $scope.getUAVByWs = function(ws) {
      var id = $scope.getIdByWs(ws);
      if (id >= 0) {
        return $scope.uavs[id];
      } else {
      // how to handle no object?
      }
    };

    $scope.getCurrentUAVId = function () {
      return $scope.current_uav_id;
    };

    $scope.getCurrentUAV = function () {
      if($scope.current_uav_id !== -1) {
        return $scope.uavs[$scope.current_uav_id];
      } else {
        return null;
      }
    };

    $scope.getNumUAVs = function () {
      return $scope.uavs.length;
    };

    $scope.setCurrentUAV = function(id) {
      if($scope.uavs.length > id){
        $scope.current_uav_id = id;
      }
    };

    $scope.addUAV = function(url) {
      console.log(url);
      var id = $scope.uavs.length;
      var new_uav = UAVFactory();
      new_uav.connect(url);
      $scope.uavs[id] = new_uav;
      $scope.setCurrentUAV(id);
    };
////////////////////////////// SEPARATE THESE CONCERNS ////////////////////
    // this should be handled in UAV, not the list.
    // the list should be concerned with aggregating UAVs only
    $scope.addUAVLink = function () {
      var ip_port_string = $scope.current_url;;
      console.log(ip_port_string);
      var full_address = "ws://" + ip_port_string;
      $scope.current_url = "";

      if (ip_port_string !== "sw-testing"){
        full_address += "/websocket";
          if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip_port_string))
          {
              $scope.addUAV(full_address);
          }else{
              window.alert("You have entered an invalid IP address!")
          }

      } else {
            $scope.addUAV(ip_port_string);
      }

      if(ip_port_string === "sw-testing") {
        ws.onopen();
        ws.beginTransmitting();
      }
    };

    $scope.setUpWebSocket = function (ws, uavlist) {
      // on websocket open, link the new socket to a new UAV
      // and switch focus to the new UAV
      ws.onopen = function () {
          consol.log("ws on open triggered.");
        uavlist.addUAV(ws);
        // TODO: put UI functions inside of UI Namespace?
        //addUAVTabById(uavlist.getCurrentUAVId());

        // attach an id to the ws
        ws.UAVid = uavlist.getCurrentUAVId();

        console.log("Added new UAV; id = ");
        console.log(ws.UAVid);

      }

      // process received messages
      ws.onmessage = function(evt) {
        var msg = evt.data;
        var ws_id = ws.UAVid;   // might not be needed

        // TODO: Mavlink handling module
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
  };
///////////////////////////////////////////////////////////////////////////////////////////

}]);

WebGCSControllers.controller('NavBarCtrl', [ '$scope','$websocket', function($scope, $websocket){

  $scope.tab = 1;
  $scope.setTab = function(t){
    $scope.tab = t;
  };
  $scope.isSet = function(t){
    return $scope.tab === t;
  };
//    console.log($websocket.$new({
//        url: 'ws://localhost:12345',
//        mock:true
//    }));
//    console.log(angular.isFunction($websocket));
}]);

WebGCSControllers.controller('HUDCtrl', [ '$scope', function($scope){

}]);

WebGCSControllers.controller('MapCtrl', [ '$scope', function($scope, $websocket){

}]);
