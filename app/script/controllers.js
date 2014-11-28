'use strict';

var WebGCSControllers = angular.module('WebGCSControllers', []);

WebGCSControllers.controller('UAVListCtrl', ['$scope', function($scope){
    $scope.uavs = [];
    $scope.current_uav = -1;

    $scope.getUAVById = function(id) {
      if ($scope.current_uav !== -1){
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
        return uavs[id];
      } else {
      // how to handle no object?
      }
    };

    $scope.getCurrentUAVId = function () {
      return $scope.current_uav;
    };

    $scope.getCurrentUAV = function () {
      if($scope.current_uav !== -1) {
        return $scope.uavs[$scope.current_uav];
      } else {
        return null;
      }
    };

    $scope.getNumUAVs = function () {
      return $scope.uavs.length;
    };

    $scope.setCurrentUAV = function(id) {
      if($scope.uavs.length > id){
        $scope.current_uav = id;
      }
    };

    $scope.addUAV = function(ws) {
      var id = $scope.uavs.length;
      $scope.uavs[id] = new UAV(ws, id);
      $scope.setCurrentUAV(id);
      console.log(id);
      console.log(uavs);
    };

    $scope.addUAVLink = function (ip_port_string) {
      var ws;
      var ip_port = ip_port_string.split(":");
      var full_address = "ws://" + ip_port_string;


      if (ip_port_string !== "sw-testing"){
        full_address += "/websocket";
        ws = new WebSocket(full_address);
      } else {
        ws = new WebMocket(full_address);
      }
      $scope.setUpWebSocket(ws, $scope);

      if(ip_port_string === "sw-testing") {
        ws.onopen();
        ws.beginTransmitting();
      }
    };

    $scope.setUpWebSocket = function (ws, uavlist) {
      // on websocket open, link the new socket to a new UAV
      // and switch focus to the new UAV
      ws.onopen = function () {
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
}]);

WebGCSControllers.controller('NavBarCtrl', function(){
  $scope.tab = 1;
  $scope.setTab = function(t){
    $scope.tab = t;
  };
  $scope.isSet = function(t){
    return $scope.tab === t;
  };
});
