var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 8080;
var passport = require('passport');
var flash    = require('connect-flash');

require('./config/passport')(passport); // wyślij passport do konfiguracji

app.use(morgan('dev')); // Wypisz każdy request do konsoli
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// Wymagane do passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } ));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Używane do wyświetlania wiadomości przechowywanych w sesji

require('./app/routes.js')(app, passport); // Wczytywanie routes

// Połącz
app.listen(port);
console.log('Postawiono serwer na porcie ' + port);
