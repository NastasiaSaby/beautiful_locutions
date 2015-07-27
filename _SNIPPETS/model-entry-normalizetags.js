function normalizeTags(tags) {
  // 1. N'avoir qu'un niveau de tableau, peu importe ce qui nous est passé.
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
