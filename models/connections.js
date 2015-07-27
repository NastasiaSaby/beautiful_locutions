'use strict';

//C'est ici qu'on fait la connexion à mongodb en utilisant mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/beautiful');
var db = mongoose.connection;
db.on('error', function() {
	console.error('X CANNOT connect');
});

module.exports = function(onceReady) {
	if(onceReady) {
		db.on('open', onceReady);
	}
};