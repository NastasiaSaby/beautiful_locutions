'use strict';

//Ici à la fois, on définit le schéma et on définit les méthodes pour requêter dans l'extend

var mongoose = require('mongoose');
var _ = require('underscore');
var Promise = require('rsvp').Promise;

var limit = 10;


var entrySchema = new mongoose.Schema({
    name: { type: String, required: true},
    firstname: { type: String, required: true},
	comments: [{
		author: { type: String, ref: 'User'},
		text: { type: String, required: true, trim: true},
		postedAt: { type: Date, default: Date.now, index: true}
	}],
	excerpt: String,
	postedAt: { type: Date, default: Date.now, index: true },
	poster: { type: String, ref: 'User'},
	score: { type: Number, default: 0 },
	tags: [String],
	expression: { type: String, required: true },
	upVoters: [{ type: String, ref: 'User'}],
	downVoters: [{ type: String, ref: 'User'}]
});

_.extend(entrySchema.methods, {
	comment: function comment(user, text) {
		var fields = { author: user, text: text };
		return this.update({ $push: { comments: fields }}).exec();
	},

	voteBy: function voteBy(user, offset) {
		user = user.id || user;

		var votersDiff = offset > 0 ? { upVoters: user } : { downVoters: user };
		return this.update({
			$inc: { score: offset },
			$addToSet: votersDiff

		}).exec();
	},

	votedBy: function votedBy(user) {
		user = user.id || user;
		return _.contains(this.upVoters, user) || _.contains(this.downVoters, user);
	}
});

_.extend(entrySchema.statics, {
    getNbPage: function getNbPage(filter) {
        var scope = this.count();

        var tags = normalizeTags(_.isString(filter) ? filter : (filter && filter.tags));

        if(0 === tags.length) {
            if(0 === tags.length) {
                return scope.exec()
                    .then(function(scope) {
                        return new Promise (function(resolve, reject) {
                            resolve(Math.ceil(scope/limit));
                        });
                    }
                )

            }
            //return scope.exec();
        }

        var op = ('any' === (filter && filter.tagMode) ? 'in' : 'all');
        return scope.where('tags')[op](tags).exec()
            .then(function(scope) {
                return new Promise (function(resolve, reject) {
                    resolve(Math.ceil(scope/limit));
                });
            }
        )


    },
	getEntries: function getEntries(filter) {
        var page = filter.skip-1;

		var scope = this.find().populate('poster comments').sort({score:-1, postedAt:-1});

		var tags = normalizeTags(_.isString(filter) ? filter : (filter && filter.tags));

		if(0 === tags.length && page != -1) {
			return scope.limit(limit).skip((page)*limit).exec();
		}
        else if (0 === tags.length && page == -1)  {
            return scope.limit(limit).skip((1)*limit).exec();
        }
        else if (0 != tags.length && page != -1) {
            var op = ('any' === (filter && filter.tagMode) ? 'in' : 'all');
            return scope.where('tags')[op](tags).limit(limit).skip((page)*limit).exec();
        }
        else {
            var op = ('any' === (filter && filter.tagMode) ? 'in' : 'all');
            return scope.where('tags')[op](tags).limit(limit).skip((1)*limit).exec();
        }
	},
	//Pour lui demander une promesse, on met exec
	getEntry: function getEntry(id) {
		return this.findById(id).populate('poster').exec();
	},
	//A la création, formate tags
	post: function postEntry(fields) {
		fields.tags = normalizeTags(fields.tags);
		return this.create(fields);
	},

	tags: function tags() {
		return this.aggregate(
			{ $project: { tags:1 }},
			{ $unwind: '$tags'},
			{ $group: { _id: '$tags'}}
		).exec().then(function(tuples) {
			return _.pluck(tuples, '_id');
		});
	}	
});




module.exports = mongoose.model('Entry', entrySchema);

//Fonction pour normaliser les tags
function normalizeTags(tags) {
  // 1. N'avoir qu'un niveau de tableau, peu importe ce qui nous est passé. (possible avec flaten)
  tags = _.flatten([_.isString(tags) ? tags.trim() : tags]);
  // 2. Virer les `null` et `undefined` éventuels, passer en minuscules, découper sur séparateurs éventuels,
  // ré-aplatir (le `.split` a engendré un tableau de tableaux), virer le whitespace autour, et finalement trier le tout.
  // Notez le chaînage initial histoire de pouvoir enquiller les appels façon Objet plutôt que d'imbriquer des appels
  // de type `_.method(…)` à n'en plus finir (on récupère la valeur obtenue au final avec `.value()`).
  tags = _.chain(tags).compact().map(function(s) {
    return s.toLowerCase().split(/[,\s]+/);
  }).flatten().invoke('trim').value().sort();
  // 3. Dédoublonner en précisant que c'est déjà trié (ce qui optimise l'algo en *O(n)* plutôt qu'en *O(n²)*).
  return _.unique(tags, true);
}

