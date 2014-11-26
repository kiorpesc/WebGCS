var zombie = require('zombie');
var WorldConstructor = function WorldConstructor(callback) {
  this.browser = new zombie(); // this.browser will be available in step definitions

  var world = {
    visit: function(url, callback) {
      this.browser.visit(url, callback);
    }.bind(this),
    evaluate: function(js_str) {
        return this.browser.evaluate(js_str);  
    }.bind(this),
      clickLink: function(link_str, callback) {
          this.browser.clickLink(link_str, callback);
      }.bind(this),
  };

  callback(world); // tell Cucumber we're finished and to use our world object instead of 'this'
};
exports.World = WorldConstructor;
