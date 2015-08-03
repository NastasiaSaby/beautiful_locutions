'use strict';

//Dans un controller, on définit à la fois les routes et les actions de controller

//On require le model associé
var Entry = require('../models/entry');
var express = require('express');

//On va chercher le router pour créer les routes
var router = new express.Router();

//Pour lire des flux
var qhttp = require('q-io/http');

//Pour lire des flux html
var unfluff = require('unfluff');

//Pour paralléliser des promesses
var Promise = require('rsvp').Promise;
var notifier = require('./web-sockets');

//Après on utilise "Promise.all" :
/*
Promise.all([
	Entry.getEntries(req.query),
	Entry.count.exec()])
	.then(function(result) {
		res.render('entries/index', {pageTitle: 'Les bookmamks', entries: result[0], totalEntries: result[1] });
	})
*/

//Les uses permettent de dire que pour certaines routes, on utilise certaines méthodes
//Vaut pour toutes les routes du controller comme pas précisé
router.use(checkAuthenticated);

router.use('/:id', loadAndVerifyEntry);

//Là on définit les routes, en appelant à chaque fois le controller
router.get('/',					listEntries);
router.post('/',				createEntry);
router.get('/new',			newEntry);
router.get('/:id',				showEntry);
router.patch('/:id/downvote',	downoteEntry);
router.patch('/:id/upvote',	upvoteEntry);
router.post('/:id/comments',	commentEntry);


//Vérifie qu'on a bien un user, sinon dit qu'il faut être connecté et on ne voit rien
function checkAuthenticated(req, res, next) {
	if (req.user) {
		return next();
	}

	req.flash('info', 'Vous devez être authentifié');
	res.redirect('/');
}


function commentEntry(req, res) {
	req.entry.comment(req.user, req.body.text)
	.then(
		function() {
			req.flash('success', 'Votre cool');
		},
		function(err) {
			req.flash('error', 'Non' + err.message);
		}
		)
	.then(function() {
		res.redirect('/entries/'+req.entry.id);
	});
}

function createEntry(req, res) {
	Entry.post ({
			tags: req.body.tags,
			poster: req.user,
			expression: req.body.expression,
            firstname: req.body.firstname,
            name: req.body.name
		})
	.then(function(entry) {
		//Quand all is good, que l'entry est bien enregistré, on le balance en émission web socket
		var notif = entry.toJSON();
		notif.poster = req.user;
		notifier.sockets.emit('new-entry', notif);

		req.flash('success', 'Votre jolie phrase a bien été créée');
		res.redirect('/entries/' + entry.id);
	})
	.then(null, function(err) {
		req.flash('error', 'erreur ' + err.message);
		res.redirect('/entries/new');
	});
}

function downoteEntry(req, res) {
	voteOnEntry(req, res, -1);
}

function listEntries(req, res) {
	//Quand on a plusieurs choses à required, permet de paralléliser les promesses
	//pour ensuite quand on a tout passé à la suite (Génial !)
	Promise.all([
	Entry.getEntries(req.query),
	Entry.count().exec(),
	Entry.tags(),
    Entry.getNbPage(req.query)
	])
	.then(function(result) {
		res.render('entries/index', {
            pageTitle: 'Phrases',
            entries: result[0],
            totalEntries: result[1],
            tags: result[2],
            nbPage: result[3],
            skip: req.query.skip || 1
        });
	})
	.then(null, function(err) {
		req.flash('info', "Impossible de voir les bookmarks" + err.message);
		res.redirect('/entries');
	});
	
}

function newEntry(req, res) {
	Entry.tags().then(function(tags) {
		res.render('entries/new', {pageTitle: 'Nouveau bookmark', tags: tags});
	});
	
}

var BSON_ID = /^[a-f0-9]{24}$/;

//Fonction commune aux actions qui travaille sur l'entry
function loadAndVerifyEntry(req, res, next) {
	if (!BSON_ID.test(req.params.id)) {
		return next();
	}
	Entry.getEntry(req.params.id)
	.then(function(entry) {
		if (!entry) {
			throw new Error('No entry found for ID' + req.params.id);
		}
		req.entry = entry;
		next();
	})
	.then(null, function(err) {
		req.falsh('info', "Ce bookmark n'existe pas" + err.message);
		res.redirect('/entries');
	});
}

function showEntry(req, res) {
	
	res.render('entries/show', { pageTitle: req.entry.title, entry: req.entry});
	
}

function upvoteEntry(req, res) {
	voteOnEntry(req, res, +1);
}

function voteOnEntry(req, res, offset) {
	if (req.entry.votedBy(req.user)) {
		req.flash('error', 'Vous avez déjà voté pour ce bookmark');
		return res.redirect('/entries/' + req.entry.id);
	}

	req.entry.voteBy(req.user, offset)
	.then(
		function()    { req.flash('success', 'ok'); },
		function(err) { req.flash('error', 'ko: ' + err.message); }
	).then( function() {
		res.redirect('/entries/' + req.entry.id);
	});
}


router.get('/', function(req, res) {
	res.render('home');
});

module.exports = router;