'use strict';

(function() {
  var app = angular.module('WebGCS', ['WebGCSControllers', 'WebGCSServices', 'uiGmapgoogle-maps']);
  app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDB9QrUFbd68O-tYZTEkRdgeqizBa30lxc',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
  })
})();
