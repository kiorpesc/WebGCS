var myStepDefinitionsWrapper = function () {
  this.World = require("../support/world.js").World; // overwrite default World constructor

  var assert = require('assert');
    
  this.Given(/^I am viewing the app$/, function(callback) {
    // Express the regexp above with the code you wish you had.
    // `this` is set to a new this.World instance.
    // i.e. you may use this.browser to execute the step:

      this.visit('http://fly.quadworkshop.com', callback);

    // The callback is passed to visit() so that when the job's finished, the next step can
    // be executed by Cucumber.
  });

  this.Given(/^There are no UAVs connected$/, function(callback) {
      var nUAVs = this.evaluate("window.uavs.getNumUAVs()");
      if (nUAVs === 0) {
          callback();
      } else {
          callback.fail(new Error("Number of UAVs - Expected: 0, Actual: " + nUAVs));
      }
  });
    
  this.When(/^I click the Flight Modes button$/, function(callback) {
      // Express the regexp above with the code you wish you had. Call callback() at the end
      // of the step, or callback.pending() if the step is not yet implemented:
      this.clickLink("#flight-mode-link", callback);
  });

  this.Then(/^I should not see any flight modes$/, function(callback) {
      var modes = this.html("#flight-modes");
  
      if (modes === ""){
          callback();
      } else {
          callback.fail(new Error("Flight mode div not empty."));
      }
  });  
  
  this.Given(/^I connect a single UAV$/, function(callback) {
      this.clickLink("#add-uav-link", function() {
          browser.fill("#uav_ip", "sw-testing").pressButton("#submit-uav", callback);
      })
  });  
    
  this.Then(/^I should see "(.*)" as the page title$/, function(title, callback) {
    // matching groups are passed as parameters to the step definition

    var pageTitle = this.browser.text('title');
    if (title === pageTitle) {
      callback();
    } else {
      callback.fail(new Error("Expected to be on page with title " + title));
    }
  });
};

module.exports = myStepDefinitionsWrapper;