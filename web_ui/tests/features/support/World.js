// features/support/world.js
var webdriver = require("selenium-webdriver");

var World = function World(callback) {
    this.driver = new webdriver.Builder().
      withCapabilities(webdriver.Capabilities.chrome()).
      build();

    callback();
}

module.exports = World;

// features/support/after_hooks.js
var myAfterHooks = function () {
    this.registerHandler('AfterFeatures', function (event, callback) {
      this.driver.close();
      callback();
    });
}

module.exports = myAfterHooks;
