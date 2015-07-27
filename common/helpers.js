// Helpers partagés serveur/client
// ===============================

'use strict';

/* global window */

// Sauf à coller underscore et moment à la racine du projet (burk)
// y'a pas trop de moyen d'avoir simplement un `require` uniforme
// entre Node et Brunch sur ce coup (même en déplaçant toute la partie
// Brunch : `config.coffee`, `package.json` et `node_modules` dédiés
// dans `client`).  Donc on les inclue en mode `vendor` (pas d'enrobage
// CommonJS) et on se base sur la présence de `window` pour caler nos
// variables locales.
var inBrowser = 'undefined' !== typeof window;
var _ = inBrowser ? window._ : require('underscore');
var moment = inBrowser ?  window.moment : require('moment');
// En mode browser, la langue FR aura été implicitement chargée, comme
// le reste (underscore, moment, jQuery…).
if (!inBrowser) {
  require('moment/locale/fr');
}

module.exports = function(helpers) {
  _.extend(helpers, {
    // Formatage de date/heure sur format libre, avec un format long
    // comme défaut.  On peut aussi lui passer une entité équipée d'un
    // champ `postedAt` (bookmark, commentaire) qui sera alors utilisé.
    formatDate: function formatDate(d, format) {
      d = d.postedAt || d;

      return moment(d).format(format || 'dddd D MMMM YYYY à HH:mm');
    },

    // Pluraliseur basique FR, la forme plurielle étant optionnelle
    // (si elle n'est pas fournie, on ajoutera un "s" au singulier).
    pluralize: function pluralize(count, singular, plural) {
      return count + ' ' + (count > 1 ? plural || singular + 's' : singular);
    }
  });
};
