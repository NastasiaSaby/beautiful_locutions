'use strict';

var helpers = require('common/helpers');
var template = require('common/views/entry');

/* global $ */
/* global io */
$(initNotifications);

//Permet de notifier quand il y a une nouvelle entrée uniquement quand on a table#entries ...
function initNotifications() {
	var container = $('table#entries tbody');
	if(0 === container.length) {
		return;
	}

	var socket = io.connect();
	socket.on('new-entry', function(entry) {
		var locals = { entry: entry, injected: true };
		helpers(locals);
		container.prepend(template(locals));
		setTimeout(function() {
			container.find('tr.injected').removeClass('injected');
		}, 3000);
	});
}