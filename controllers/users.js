'use strict';

var express = require('express');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user.js');

var router = new express.Router();

['twitter', 'facebook'].forEach(function(provider) {
	router.get('/get-in/' + provider, passport.authenticate(provider));
	router.get('/auth/'+ provider +'/callback', passport.authenticate(provider, {
	successRedirect: '/entries',
	failureRedirect: '/',
	failureFlash: true
	}));
});


router.get('/logout', logout);

module.exports = router;

function logout(req, res) {
	req.logout();
	req.flash('success', 'Déconnecté');
	res.redirect('/');
}

passport.serializeUser(function(id, done) {
	done(null, id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, done);
});

//Strategy configuration
passport.use(new TwitterStrategy({
  consumerKey: '0mC7OanUtfH0ZHOn7xD7Aw',
  consumerSecret: 'Ch8Fy2bFgIMnnlPyB9stgTkwO06yOu4Of3PjhiDaXA',
  callbackURL: '/users/auth/twitter/callback'
}, function(token, tokenSecret, profile, done) {
  User.findOrCreateByAuth('@' + profile.username, profile.displayName, 'twitter', done);
}));

passport.use(new FacebookStrategy({
  clientID: '213376528865347',
  clientSecret: '753494ad3c02f9d9b5fb3617bbd88c1e',
  callbackURL: '/users/auth/facebook/callback'
}, function(token, tokenSecret, profile, done) {
  User.findOrCreateByAuth(profile.id, profile.displayName, 'facebook', done);
}));
