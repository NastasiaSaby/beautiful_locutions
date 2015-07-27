'use strict';

//Met en place les websockets

var io = require('socket.io');

function socketsController(server) {
	var ws = io(server);
	socketsController.sockets = ws.sockets;
}

module.exports = socketsController;