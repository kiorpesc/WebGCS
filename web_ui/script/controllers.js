'use strict';

var WebGCSControllers = angular.module('WebGCSControllers', []);

WebGCSControllers.controller('UAVListCtrl', ['$scope', 'UAV', function(){
  this.list = [];
}]);

WebGCSControllers.controller('NavBarCtrl', function(){
  this.tab = 1;
  this.setTab = function(t){
    this.tab = t;
  };
  this.isSet = function(t){
    return this.tab === t;
  };
});
