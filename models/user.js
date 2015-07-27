'use strict';

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	joinedAt: { type: Date, default: Date.now },
	name: String,
	provider: { type: String, required: true}
});

userSchema.statics.findOrCreateByAuth = function findOrCreateByAuth(id, name, provider, done) {
  var User = this;
  User.update(
    { _id: id, provider : provider },
    { name: name },
    { upsert: true },

    function(err, result) {
      if (err) {
        return done(err);
      }

      if (!result.upserted) {
        return done(null, id);
      }

      User.update(
        { _id: id, provider: provider },
        { joinedAt: Date.now() },
        null,
        function(err) { done(err, id); }
      );
    });
};


module.exports = mongoose.model('User', userSchema);