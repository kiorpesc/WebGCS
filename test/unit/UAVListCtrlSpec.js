/**
* Created with WebGCS-Angular.
* User: kiorpesc
* Date: 2014-11-27
* Time: 08:12 PM
* To change this template use Tools | Templates.
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
    var $scope, ctrl;
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
      var bogus_ws = { url : "nowhere" };
      var new_uav = uav_fact;
      expect($scope.getNumUAVs()).toBe(0);
      $scope.addUAV(new_uav, bogus_ws);
      expect($scope.getCurrentUAVId()).toBe(0);
      expect($scope.uavs[0]).toBeDefined();
    });
  });


});
