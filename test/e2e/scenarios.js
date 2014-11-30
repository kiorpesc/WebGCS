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
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();

      submit_button.click();

      var uavs = element.all(by.repeater('uav in uavs'));

      expect(uavs.count()).toBe(1);
    });


    it('should render phone specific links', function() {
      var query = element(by.model('query'));
      query.sendKeys('nexus');
      element.all(by.css('.phones li a')).first().click();
      browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBe('/phones/nexus-s');
      });
    });

    it('should alert the user if the WebSocket conection fails', function() {
      var add_uav = element(by.id("add_uav_link"));
      var url_input = element(by.id("uav_ip"));
      var submit_button = element(by.id('submit_uav'));

      add_uav.click();

      url_input.sendKeys("bogus");

      submit_button.click();

      driver.switchTo().alert().dismiss();
      // if the alert is not there, it should throw an error
    });
  });


  describe('Phone detail view', function() {

    beforeEach(function() {
      browser.get('app/index.html#/phones/nexus-s');
    });


    it('should display nexus-s page', function() {
      expect(element(by.binding('phone.name')).getText()).toBe('Nexus S');
    });


    it('should display the first phone image as the main phone image', function() {
      expect(element(by.css('img.phone.active')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });


    it('should swap main image if a thumbnail image is clicked on', function() {
      element(by.css('.phone-thumbs li:nth-child(3) img')).click();
      expect(element(by.css('img.phone.active')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.2.jpg/);

      element(by.css('.phone-thumbs li:nth-child(1) img')).click();
      expect(element(by.css('img.phone.active')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });
  });
});
