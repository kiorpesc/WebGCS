/**
* Created with WebGCS-Angular.
* User: kiorpesc
* Date: 2014-11-27
* Time: 08:12 PM
*
* Unit tests for the app's controllers
*/

describe('WebGCSControllers', function() {

  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });


  beforeEach(module('WebGCS'));
  //beforeEach(module('WebGCSControllers'));

  describe('UAVListCtrl', function () {
    var $scope, ctrl, $log;
    beforeEach(function() {
      module('WebGCS');
      module('WebGCSControllers');
      module('WebGCSServices');
      inject(function($rootScope, $controller, _UAVFactory_) {
        $scope = $rootScope.$new();
        ctrl = $controller('UAVListCtrl', { $scope : $scope });
        uav_fact = _UAVFactory_;
      });
    });

    it('should be initialized with 0 uavs.', function() {
        //var scope = {};
        //var ctrl = $controller('UAVListCtrl', { $scope : scope });
        expect($scope.current_uav_id).toBe(-1);
        expect($scope.uavs.length).toBe(0);
    });

    it('should not set its current_uav to a nonexistant id.', function() {
        //var scope = {};
        //var ctrl = $controller('UAVListCtrl', { $scope : scope });
        $scope.setCurrentUAV(2);
        expect($scope.getCurrentUAVId()).toBe(-1);
    });

    it('should return null when getCurrentUAV() is called when there are no UAVs', function() {
        //var scope = {};
        //var ctrl = $controller('UAVListCtrl', { $scope : scope });
        var aUAV = $scope.getCurrentUAV();
        expect(aUAV).toBe(null);

    });

    // more unit tests
    it('should add a new UAV of id 0 when addUAV() is called for the first time', function() {
      var bogus_url = "sw-testing";
      //var new_uav = uav_fact;
      expect($scope.getNumUAVs()).toBe(0);
      $scope.addUAV(bogus_url);
      expect($scope.getCurrentUAVId()).toBe(0);
      expect($scope.uavs[0]).toBeDefined();
      expect($scope.uavs[0].id).toBe(0);
    });

    it('should return false if isActiveUAV(0) is called before a UAV has been added', function() {
      expect($scope.isActiveUAV(0)).toBe(false);
    });

    // this test will change when addUAVLink() doesn't exist anymore
    it('should not have addUAVLink() call addUAV() if WebSocket connection fails', function() {
      $scope.current_url = "bogus";
      $scope.addUAVLink();
      expect($scope.getNumUAVs()).toBe(0);
    });

  });

  describe('NavBarCtrl', function() {
    var $scope, ctrl;
    beforeEach(function(){
      module('WebGCS');
      module('WebGCSControllers');
      inject(function($rootScope, $controller){
        $scope = $rootScope.$new();
        ctrl = $controller('NavBarCtrl', { $scope : $scope });
      });
    });

    it('should be initialized with tab === 1', function() {
      expect($scope.tab).toBe(1);
    });

    it('should be initialized such that isSet(1) is true', function() {
      expect($scope.isSet(1)).toBe(true);
    });

    it('should return false if isSet() is called on an inactive tab', function() {
      expect($scope.isSet(2)).toBe(false);
    })

    it('should set the current tab to 2 when setTab(2) is called.', function() {
      $scope.setTab(2);
      expect($scope.tab).toBe(2);
    });

  });

});
