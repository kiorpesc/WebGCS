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
	Allow craft support to be added as modules (module for Ardupilot, module for PX4, etc)
	Eliminate unnecessary CPU usage (will not need text console if commands can be handled from the web).
	Enable sending commands to UAV from web browser (via craft-specific module)

Installation:
=============

The backend requires Tornado and PyMAVLink to run.
PyMAVLink can be installed via pip (pip install pymavlink).

Once these two libraries are installed, simply run the backend server
on whichever computer is connected to your vehicle (can be serial,
UDP, or TCP).

        python webgcs_server.py -p <port> -m <mavlink device (ex: '/dev/ttyACM0')> -b <baud rate>

Once the server is running, open the index.html file in the web_ui folder on any machine and click "Add UAV."  Enter the address and port of the server (ex: localhost:8888) and Submit, and you should start seeing information from your vehicle on the website in realtime.
