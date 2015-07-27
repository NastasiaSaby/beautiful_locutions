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
