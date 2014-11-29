WebGCS
======

branch: angular-port

A reimplementation of WebGCS using AngularJS, and writing tests
as development occurs.

It offers a live view of any autopilot that supports
standard MAVLink messages.

DONE:
-----

- Basic UI reimplementation
- Controllers for UAVList, NavBar
- UAV Provider, MAVLink service
- Basic Google Maps

TODO:
-----

- Reimplement remaining functionality of old scripts:
 - Websocket connection for each UAV
 - Live UI changes based on messages received on the websocket
- Reduce page into better templated sections for more modularity
- End-to-end tests

Installation:
=============

Clone the repository.

Then:
```
npm install
```

This should download all the necessary packages.

To run the unit tests, run:
```
npm test
```
This will launch Karma and run tests using Chrome.

To run the web tests, you need two terminal windows.

In the first, run:
```
npm start
```
This will run the app on localhost:8000/app
In the second, run
```
npm run protractor
```
This will run all web tests.

Functionality:
==============

The app is supposed to:

1. Connect to one or more UAVs via WebSockets.
2. Show the status, location, and parameters of the UAV(s) in real time.
3. Allow mode change commands to be send to the UAV(s).
4. Allow disconnection from a UAV.
