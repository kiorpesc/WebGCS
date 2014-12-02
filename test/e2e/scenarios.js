'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('WebGCS App', function() {

  it('should not redirect index', function() {
    browser.get('app/index.html');
    browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBeUndefined();
      });
  });


  describe('Flight view', function() {

    beforeEach(function() {
      browser.get('app/index.html');
    });


    it('should display the top navbar', function() {
      var navbar = element(by.id('topnav'));
      expect(navbar).toBeDefined();
    });


    it('should be possible to add a UAV to the navbar', function() {

      var add_uav = element(by.id("add_uav_link"));
      var url_input = element(by.id("uav_ip"));
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();
      url_input.sendKeys("sw-testing");
      submit_button.click();

      var uavs = element.all(by.repeater('uav in uavs'));

      expect(uavs.count()).toBe(1);
    });


    xit('should alert the user if the WebSocket conection fails', function() {
      var add_uav = element(by.id("add_uav_link"));
      var url_input = element(by.id("uav_ip"));
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();

      url_input.sendKeys("bogus");

      submit_button.click();

      browser.switchTo().alert().dismiss();
      // if the alert is not there, it should throw an error
    });

    it('should allow the user to remove the current UAV', function() {
      var add_uav = element(by.id("add_uav_link"));
      var url_input = element(by.id("uav_ip"));
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();
      url_input.sendKeys("sw-testing");
      submit_button.click();

      var uavs = element.all(by.repeater('uav in uavs'));

      expect(uavs.count()).toBe(1);
      //add_uav.click();
      url_input.sendKeys("sw-testing");
      submit_button.click();
      uavs = element.all(by.repeater('uav in uavs'));
      expect(uavs.count()).toBe(2);

      var remove_button = element(by.id('disconnect_link'));
      remove_button.click();
      uavs = element.all(by.repeater('uav in uavs'));
      expect(uavs.count()).toBe(1);

    })

  });
});
