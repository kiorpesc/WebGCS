/**
* Created with WebGCS-Angular.
* User: kiorpesc
* Date: 2014-11-27
* Time: 08:12 PM
* To change this template use Tools | Templates.
*/

describe('UAVListCtrl unit tests', function () {
    beforeEach(module('WebGCS'));
    
    it('should be initialized with 0 uavs', inject(function($controller) {
        var scope = {},
            ctrl = $controller('UAVListCtrl', {$scope:scope});

        expect(scope.uavs.getNumUAVs()).toBe(0);      
    }));
});