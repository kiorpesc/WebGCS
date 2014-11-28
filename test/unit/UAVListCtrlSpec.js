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
      inject(function($rootScope, $controller) {
        $scope = $rootScope.$new();
        ctrl = $controller('UAVListCtrl', { $scope : $scope });
      });
    });

    it('should be initialized with 0 uavs.', inject(function($controller) {
        //var scope = {};
        //var ctrl = $controller('UAVListCtrl', { $scope : scope });
        expect($scope.current_uav).toBeDefined();
        //expect($scope.uavs.length).toBe(0);
    }));

    it('should not set its current_uav to a nonexistant id.', inject(function($controller) {
        //var scope = {};
        //var ctrl = $controller('UAVListCtrl', { $scope : scope });
        $scope.setCurrentUAV(2);
        expect($scope.current_uav).toBe(-1);
    }));

    it('should return null when getCurrentUAV() is called when there are no UAVs', inject(function($controller) {
        //var scope = {};
        //var ctrl = $controller('UAVListCtrl', { $scope : scope });
        var aUAV = $scope.getCurrentUAV();
        expect(aUAV).toBe(null);
    }));

    // more unit tests
  });


});
