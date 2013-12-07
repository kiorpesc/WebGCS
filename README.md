WebGCS
======

Web-based MAVLink ground control based on Tornado and WebSockets

This interface is meant to work on tablets, laptops, and desktops.

It offers a live view of any autopilot that supports
standard MAVLink messages.

Currently, it is only possible to watch the position and parameters
of the craft.

TODO:
	Add all submodules (dependencies)
	Re-implement websockets server as a modular MAVLink server (similar to MAVProxy, less APM focused)
		- allow craft support to be added as modules (module for Ardupilot, module for PX4, etc)
		- eliminate unnecessary CPU usage (will not need text console if commands can be handled from the web).
	Enable sending commands to UAV from web browser (via craft-specific module)

	
