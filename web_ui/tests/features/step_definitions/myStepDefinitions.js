var myStepDefinitionsWrapper = function () {
  this.World = require("../support/world.js").World; // overwrite default World constructor
  this.browser = this.World.browser;
    
  var assert = require('assert');
    
  this.Given(/^I am viewing the app$/, function(callback) {
    // Express the regexp above with the code you wish you had.
    // `this` is set to a new this.World instance.
    // i.e. you may use this.browser to execute the step:
      //this.browser.close();
      this.browser.visit('http://fly.quadworkshop.com', callback);

    // The callback is passed to visit() so that when the job's finished, the next step can
    // be executed by Cucumber.
  });

  this.Given(/^There are no UAVs connected$/, function(callback) {
      var nUAVs = this.browser.evaluate("window.uavs.getNumUAVs()");
      if (nUAVs === 0) {
          callback();
      } else {
          callback.fail(new Error("Number of UAVs - Expected: 0, Actual: " + nUAVs));
      }
  });
    
  this.When(/^I click the Flight Modes button$/, function(callback) {
      // Express the regexp above with the code you wish you had. Call callback() at the end
      // of the step, or callback.pending() if the step is not yet implemented:
      this.browser.clickLink("#flight-mode-link", callback);
  });

  this.Then(/^I should not see any flight modes$/, function(callback) {
      var modes = this.browser.html("#flight-modes");
  
      if (modes === ""){
          callback();
      } else {
          callback.fail(new Error("Flight mode div not empty."));
      }
  });  
 
  
  this.Given(/^I connect a single UAV$/, function(callback) {
      this.browser.fill("#uav_ip", "sw-testing").pressButton("#submit-uav");

      console.log(this.browser.location.toString());
      
      console.log(this.browser.window.uavs);
      
      var nUAVs = this.browser.evaluate("uavs.getNumUAVs()");
      
      assert.equal(nUAVs, 1);
      callback();
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

    this.Then(/^I should see the available flight modes for the current UAV$/, function (callback) {                                                            
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                            
                                                                              
    this.Given(/^I connect multiple UAVs$/, function (callback) {                 
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });      
    
    this.When(/^I click one of the mode buttons$/, function (callback) {          
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                                                                           
                                                                              
    this.Then(/^the mode change message should be sent to the UAV$/, function (callback) {                                                                      
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                                                                           
                                                                              
    this.Then(/^the mode change message should be sent to the correct UAV$/, function (callback) {                                                              
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                                                                           
                                                                              
    this.Given(/^I connect any number of UAVs$/, function (callback) {            
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                                                                           
                                                                              
    this.When(/^the mode is accepted by the UAV$/, function (callback) {          
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                                                                           
                                                                              
    this.Then(/^the displayed mode should update to the new mode$/, function (callback) {                                                                       
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                                                                           
                                                                              
    this.When(/^the mode is rejected by the UAV$/, function (callback) {          
        // Write code here that turns the phrase above into concrete actions        
        callback.pending();                                                         
    });                                                                           
                                                                              
    this.Then(/^the displayed mode should not change$/, function (callback) {     
        // Write code here that turns the phrase above into concrete actions        
        callback.pending(); 
    });
};

module.exports = myStepDefinitionsWrapper;

