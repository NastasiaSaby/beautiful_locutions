# Configuration Brunch
# ====================

# Détails complets de la configuration Brunch :
# https://github.com/brunch/brunch/blob/stable/docs/config.md
exports.config =
  paths:
    # Chemins à surveiller (Brunch doit être lancé depuis le répertoire porteur
    # du `package.json`, qui est la racine de l’appli).
    watched: ['client', 'common']
  # Détail des concaténations
  files:
    javascripts:
      # Tout ce qui est dans un dossier `vendor` (jQuery, Underscore, Moment…)
      # est concaténé tel quel.  Tout le reste est enrobé dans des modules CommonJS
      # (il faudra donc faire un `require` sur le point d'entrée depuis le HTML).
      joinTo: 'app.js'
    stylesheets:
      # Bootstrap, Select2 et un petit truc custom
      joinTo: 'app.css'
    templates:
      # Ça incluera les .jade partagés, qui seront précompilés en modules CommonJS
      # renvoyant des fonctions de templating prêtes à l'usage.
      joinTo: 'app.js'
