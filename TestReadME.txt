To prepare testing framework, RUN

npm install -g protractor # with sudo if necessary

webdriver-manager update # with sudo if necessary

To start the selenium web dirver
webdriver-manager start

## 
This will start up a Selenium Server and will output a bunch of info logs. Your Protractor test will send requests to this server to control a local browser. You can see information about the status of the server at http://localhost:4444/wd/hub.


Smaple test is in the web_ui/spec/todo-spec.js

Protractor requires an conf.js file and Spec files.
To execute the test suite, 

protractor conf.js

There can be an arbitrary number of conf.js (in different file names)