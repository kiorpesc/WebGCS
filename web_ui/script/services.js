'use strict';

var WebGCSServices = angular.module('WebGCSServices', ['ngResource']);

WebGCSServices.factory('UAV', ['$resource', function($resource){
  this.uav;
  this._ws;
  this._id;

  return this.uav;
}]);
