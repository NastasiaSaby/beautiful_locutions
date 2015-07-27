'use strict';

var http = require('http');
var express = require('express');

//Les flashs comme dans Symfony qu'on envoie pour dire que telle action s'est bien passée
var flash = require('connect-flash');
var path = require('path');
var publicPath = path.join(__dirname, 'public');

//Les logs
var morgan = require('morgan');

var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');

//CSRF
var csurf = require('csurf');
var User = require('./models/user');
var methodOverride = require('method-override');

//AUthentifiation (via Twitter, ...)
var passport = require('passport');

require('colors');

var app = express();

var server = http.createServer(app);


//variable d'environnement offerte par Express
app.set('port', process.env.PORT || 3000);

//view engine est une variable réservée
app.set('view engine', 'jade');


//variables qui transitent dans les views
app.locals.title = 'Les jolies phrases';

//POur définir le lien vers les CSS
app.use(express.static(publicPath));

//Configure ce qu'on a required
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride(function(req) { return req.body._method;}));
app.use(morgan('development' === app.get('env') ? 'dev' : 'combined'));

app.use(cookieSession({ key: 'wazaaaa:session', secret: "Node.js !!!"}));
app.use(csurf());
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//définition d'un middleware qu'on ajoute à la app où on met des variables disponibles pour la vue, pour l'appli en général,
//ce qui permet aussi la session avec le user
app.use(function(req, res, next) {
	res.locals.csrfToken = req.csrfToken();
	res.locals.flash = req.flash();
	res.locals.query = req.query;
	res.locals.url = req.url;
	res.locals.user = req.user;
	next();
	
});

//On require nos controllers, helpers
require('./controllers/web-sockets')(server);
require('./common/helpers')(app.locals);

if ('development' === app.get('env')) {
	app.locals.pretty = true;
}

//On utilise un middleware défini dans controllers/main
// Utilisation d'un middleware
app.use(require('./controllers/main'));

app.use('/users', require('./controllers/users'));
//Préfixe les routes d'entries
app.use('/entries', require('./controllers/entries'));

//Là, on fait la connexion à la base de donnée et en callback si all is good, on listen le server
//Appelle la fonction exportée en lui filant la callback
require('./models/connections')(function() {
	console.log(' Connection established');
	server.listen(app.get('port'), function() {
	console.log('hep'.green, app.get('port').toString().red);
	});
});


