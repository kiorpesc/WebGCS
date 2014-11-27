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
  beforeEach(module('WebGCSControllers'));

  describe('UAVListCtrl', function () {

    beforeEach(module('WebGCSControllers'));

    it('should be initialized with 0 uavs.', inject(function($controller) {
        var scope = {};
        var ctrl = $controller('UAVListCtrl', { $scope : scope });
        expect(ctrl.uavs.length).toBe(0);
    }));

    it('should not set its current_uav to a nonexistant id.', inject(function($controller) {
        var scope = {};
        var ctrl = $controller('UAVListCtrl', { $scope : scope });
        ctrl.setCurrentUAV(2);
        expect(ctrl.current_uav).toBe(-1);
    }));

    

    // more unit tests
  });


});
