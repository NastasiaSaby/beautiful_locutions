userSchema.statics.findOrCreateByAuth = function findOrCreateByAuth(id, name, provider, done) {
  var User = this;
  User.update(
    { _id: id, provider : provider },
    { name: name },
    { upsert: true },

    function(err, numAffected, details) {
      if (err) {
        return done(err);
      }

      if (details.updatedExisting) {
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
