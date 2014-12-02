'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('WebGCS App', function() {

  it('should not redirect index', function() {
    browser.get('app/index.html');
    browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBeUndefined();
      });
  });
  it('should switch to mission view when mission button was clicked', function(){
    var mission_tab = element(by.id("mission_view_button"))
    mission_tab.click();
    mission_tab.getAttribute('class').then(function(status){expect(status).toBe('active')});
  });
  it('should switch to hud view when hud button was clicked', function(){
    var hud_tab = element(by.id("mission_view_button"))
    hud_tab.click();
    hud_tab.getAttribute('class').then(function(status){expect(status).toBe('active')});
  });
  describe('Flight view', function() {

    beforeEach(function() {
      browser.get('app/index.html');
      browser.waitForAngular();
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

    // left out due to open issue with protractor handling alerts
    xit('should alert the user if the WebSocket conection fails', function() {
      var add_uav = element(by.id("add_uav_link"));
      var url_input = element(by.id("uav_ip"));
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();

      url_input.sendKeys("bogus");

      submit_button.click();

      browser.wait(function() {
        return browser.switchTo().alert().then(
          function() { return true; },
          function() { return false; }
        );
      });

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
      url_input.sendKeys("sw-testing");
      submit_button.click();
      uavs = element.all(by.repeater('uav in uavs'));
      expect(uavs.count()).toBe(2);

      var remove_button = element(by.id('disconnect_link'));
      remove_button.click();
      uavs = element.all(by.repeater('uav in uavs'));
      expect(uavs.count()).toBe(1);

    });

    it('should not reload the page when user click arm button when there is no uav', function(){
      browser.get('app/index.html#asasdas');
      browser.waitForAngular();
      var arm_button = element(by.id("arm_disarm_link"));
      arm_button.click();
      browser.getCurrentUrl().then(function(url){expect(url).toBe('http://localhost:8000/app/index.html#/asasdas' )});
    });

    it('should update UAV display properly based on user\'s selection', function(){
      var add_uav = element(by.id("add_uav_link"));
      var url_input = element(by.id("uav_ip"));
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();
      url_input.sendKeys("sw-testing");
      submit_button.click();

      var uavs = element.all(by.repeater('uav in uavs'));

      expect(uavs.count()).toBe(1);
      url_input.sendKeys("sw-testing");
      submit_button.click();
      uavs = element(by.id('uav0'));
      uavs.click();
      var display_box = element(by.id("uavid_box"));
      display_box.getText().then(function(text){expect(text).toBe('0')});

    });

    it(', when a new UAV is added, should display the information of that UAV', function(){
      var add_uav = element(by.id("add_uav_link"));
      var url_input = element(by.id("uav_ip"));
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();
      url_input.sendKeys("sw-testing");
      submit_button.click();

      var uavs = element.all(by.repeater('uav in uavs'));

      expect(uavs.count()).toBe(1);
      url_input.sendKeys("sw-testing");
      submit_button.click();

      var display_box = element(by.id("uavid_box"));
      display_box.getText().then(function(text){expect(text).toBe('1')});

    });
    it('should not reload the page when user click CenterMap and there is no uav', function(){
      browser.get('app/index.html#asasdas');
      browser.waitForAngular();
      var arm_button = element(by.id("center_map_link"));
      arm_button.click();
      browser.getCurrentUrl().then(function(url){expect(url).toBe('http://localhost:8000/app/index.html#/asasdas' )});
    });

  });
});
