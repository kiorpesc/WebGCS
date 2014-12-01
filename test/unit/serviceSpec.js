describe('WebGCSServices', function() {
  beforeEach(function(){
    module('WebGCS');
    module('WebGCSServices');
  });

  describe('MAVLinkService', function(){
    var mav_service;
    beforeEach(inject(function(_MAVLinkService_) {
      mav_service = _MAVLinkService_;
    }));

    it('should return an empty response if an invalid string is sent', function(){
      var response = mav_service.handleMAVLink("bogus");
      expect(response).toBe("");
    });

    it('should return a response with "alt" and "heading" set when a VFR_HUD message is received', function(){
      var mav_msg = {
        mavpackettype : 'VFR_HUD',
        alt : 100.0,  // meters
        heading : 200.0, // degrees
      };
      var mav_str = JSON.stringify(mav_msg);

      var response = mav_service.handleMAVLink(mav_str);
      expect(response.params.alt).toBe(100.0);
      expect(response.params.heading).toBe(200.0);
    })

    it('should return a response with "pitch" and "roll" set when an ATTITUDE message is received', function(){
      var mav_msg = {
        mavpackettype : 'ATTITUDE',
        pitch : 1.45829,  // radians?
        roll : 0.768321, // radians?
      };
      var mav_str = JSON.stringify(mav_msg);

      var response = mav_service.handleMAVLink(mav_str);
      expect(response.params.pitch).toBe(1.45829);
      expect(response.params.roll).toBe(0.768321);
    });

    it('should return a response with "lat" and "lon" set when a GPS_RAW_INT message is received', function(){
      var mav_msg = {
        mavpackettype : 'GPS_RAW_INT',
        lat : 400000001,
        lon : 400000001,
      };
      var mav_str = JSON.stringify(mav_msg);

      var response = mav_service.handleMAVLink(mav_str);
      expect(response.params.lat).toBe(40.0000001);
      expect(response.params.lon).toBe(40.0000001);
    });

    it('should return a response with a list of flight modes when an array of strings is sent in', function(){
      var mav_msg = [ 'MANUAL', 'AUTO', 'EASY' ];
      var mav_str = JSON.stringify(mav_msg);

      var response = mav_service.handleMAVLink(mav_str);

      expect(response.flight_modes).toEqual(mav_msg);
    });

    it('should return a response with a "voltage" param when a SYS_STATUS message is received', function() {
      var mav_msg = {
        mavpackettype : 'SYS_STATUS',
        voltage_battery : 12500,  //millivolts
      };
      var mav_str = JSON.stringify(mav_msg);
      var response = mav_service.handleMAVLink(mav_str);
      expect(response.params.voltage).toBe(12.50);
    })

    it('should Throw an error with status text when a STATUSTEXT message is received', function() {
      var mav_msg = {
        mavpackettype : 'STATUSTEXT',
        text : 'Some text.',
      };
      var mav_str = JSON.stringify(mav_msg);

      expect(function(){mav_service.handleMAVLink(mav_str);}).toThrow("Some text.");
    });

    it('should return a reponse with relevant heartbeat params set when a HEARTBEAT is received', function() {
      var mav_msg = {
        mavpackettype : 'HEARTBEAT',
        base_mode : 0,
        custom_mode : 0,
        system_state : 3,
        autopilot : 12,
      };
      var mav_str = JSON.stringify(mav_msg);
      var response = mav_service.handleMAVLink(mav_str);
      expect(response.params.base_mode).toBe(0);
      expect(response.params.custom_mode).toBe(0);
      expect(response.params.system_state).toBe(3);
      expect(response.params.autopilot).toBe(12);
    });
  });

  describe('UAVFactory', function() {
    var mav_service, uav_factory, websocket;
    beforeEach(function() {
      module('ngWebsocket');
      inject(function(_MAVLinkService_, _UAVFactory_, $websocket) {
      mav_service = _MAVLinkService_;
      uav_factory = _UAVFactory_;
      websocket =  $websocket;
    })});

    it('- websocket variable should be defined in tests.', function() {
      expect(websocket).toBeDefined();
    });

    it('should return a UAV object', function() {
      var new_uav = uav_factory();
      expect(new_uav).toBeDefined();
      expect(angular.isObject(new_uav)).toBe(true);
      expect(new_uav.params).toBeDefined();
    });

    it('should add a websocket when connect() is called with "sw-testing"', function() {
      var new_uav = uav_factory();
      new_uav.connect("sw-testing");
      expect(new_uav.socket).toBeDefined();
    });

    it('should fail to add a websocket when connect() is called with an invalid IP', function() {
      var new_uav = uav_factory();
      expect(function() {new_uav.connect("not an ip address")}).toThrow();
      expect(new_uav.socket).toBe(null);
    });

    it('should add the event handling functions to the websocket', function() {
      var new_uav = uav_factory();
      new_uav.connect("sw-testing", 0);

    });

  });
})
