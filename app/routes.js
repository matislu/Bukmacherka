module.exports = function(app, passport) {

	
	// Strona główna
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// Strona logowania klienta
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// Odebranie danych logowania klienta
	app.post('/login', passport.authenticate('local-login', { // Sprawdzenie danych przez passport
            successRedirect : '/profile',
            failureRedirect : '/login',
            failureFlash : true
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// Strona logowania pracownika
	app.get('/praclogin', function(req, res) {	
		res.render('praclogin.ejs', { message: req.flash('loginMessage') });
	});

	// Odebranie danych logowania pracownika
	app.post('/praclogin', passport.authenticate('local-login2', { // Sprawdzenie danych przez passport
		successRedirect : '/pracprofile', 
		failureRedirect : '/praclogin',
		failureFlash : true
	}),
	function(req, res) {
		console.log("hello");

		if (req.body.remember) {
		  req.session.cookie.maxAge = 1000 * 60 * 3;
		} else {
		  req.session.cookie.expires = false;
		}
	res.redirect('/');
	});

	// Strona z rejestracją klienta
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// Odebranie danych rejestracji
	app.post('/signup', passport.authenticate('local-signup', { // Sprawdzenie przez passport. Jeśli ok -> zapis do bazy
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true 
	}));

	// Regulamin
	app.get('/regulamin', function(req, res) {
		res.render('regulamin.ejs', { message: req.flash('regulaminMessage') });
	});

	// Powrót z regulaminu do strony głównej
	app.get('/regulaminback', function(req, res) {
		res.redirect('/');
	});

	// Mapka z punktami
	app.get('/mapka', function(req, res) {
		res.render('mapka.ejs', { message: req.flash('mapkaMessage') });
	});
	
	// Powrót z mapy do strony głównej
	app.get('/mapaback', function(req, res) {
		res.redirect('/');
	});
	
	// Profil klienta - musi być zalogowany
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs');
	});

	// Profil pracownika - musi być zalogowany
	app.get('/pracprofile', isLoggedIn, function(req, res) {
		res.render('pracprofile.ejs');
	});

	// Wylogowanie
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// Sprawdzanie czy użytkownik jest zalogowany
function isLoggedIn(req, res, next) {

	// Jeśli jest uwierzytelniony - nie przerywaj
	if (req.isAuthenticated())
		return next();

	// Jeśli nie jest, wróć do strony głównej
	res.redirect('/');
}
