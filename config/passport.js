var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {

    // Serializacja użytkownika na potrzeby sesji
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserializacja po zakończeniu
    passport.deserializeUser(function(id, done) {
        if(id==1) {
            connection.query("SELECT * FROM pracownik WHERE id = ? ",[id], function(err, rows){
                done(err, rows[0]);
            });
        }
        else{
            connection.query("SELECT * FROM klient WHERE id = ? ",[id], function(err, rows){
                done(err, rows[0]);
            });
        }
    });

    // Rejestracja klienta
    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'pesel',  // Po peselu sprawdzamy czy jest już taki użytkownik w bazie
            passwordField : 'haslo',  // Hasło będzie hashowane podczas wpisywania do bazy
                                      // Resztę pól z danymi musimy wpisać niżej
            passReqToCallback : true
        },
        function(req, pesel, haslo, done) {
            // Szukaj w bazie danych użytkownika o podanym peselu
            connection.query("SELECT * FROM klient WHERE PESEL = ?",[pesel], function(err, rows) { 
                if (err)
                    return done(err);
                if (rows.length) {
                    // Jeśli znaleziono, zwróć informację że pesel jeste już zajęty
                    // Następuje odświeżenie strony i wyświetlenie komunikatu
                    return done(null, false, req.flash('signupMessage', 'Pesel zajęty.'));
                } else {
                    // Jeśli nie znaleziono klienta o podanym peselu, tworzymy takiego

                    //Pobieranie danych wpisanych przez klienta do zmiennych
                    var imie = req.body.imie;
                    var nazwisko = req.body.nazwisko;
                    var nrtel = req.body.nrtel;
                    var nrkonta = req.body.nrkonta;
                    var kodpoczt = req.body.kodpoczt;
                    var miasto = req.body.miasto;
                    var ulica = req.body.ulica;
                    var nrbud = req.body.nrbud;
                    var nrmie = req.body.nrmie;
                    var email = req.body.email;
                    
                    //Tworzenie nowego klienta
                    var newUserMysql = {
                        IMIE: imie,
                        NAZWISKO: nazwisko,
                        PESEL: pesel,
                        HASLO: bcrypt.hashSync(haslo, null, null),
                        NUMER_TELEFONU: nrtel,
                        NUMER_KONTA: nrkonta,
                        KOD_POCZTOWY: kodpoczt,
                        MIASTO: miasto,
                        ULICA: ulica,
                        NUMER_BUDYNKU: nrbud,
                        NUMER_MIESZKANIA: nrmie,
                        EMAIL: email
                    };

                    //Wpisywanie klienta do bazy
                    var insertQuery = "INSERT INTO klient ( IMIE, NAZWISKO, PESEL, HASLO, NUMER_TELEFONU, NUMER_KONTA, \
                        KOD_POCZTOWY, MIASTO, ULICA, NUMER_BUDYNKU, NUMER_MIESZKANIA, EMAIL) values (?,?,?,?,?,?,?,?,?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.IMIE, newUserMysql.NAZWISKO, newUserMysql.PESEL, newUserMysql.HASLO,
                        newUserMysql.NUMER_TELEFONU, newUserMysql.NUMER_KONTA, newUserMysql.KOD_POCZTOWY, newUserMysql.MIASTO,
                        newUserMysql.ULICA, newUserMysql.NUMER_BUDYNKU, newUserMysql.NUMER_MIESZKANIA, newUserMysql.EMAIL],function(err, rows) {
                        
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // Logowanie klienta
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'pesel',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, pesel, password, done) { 
            // Znajdź klienta o podanym peselu
            connection.query("SELECT * FROM klient WHERE PESEL = ?",[pesel], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    // Jeśli nie znaleziono, powiadom użytkownika
                    return done(null, false, req.flash('loginMessage', 'Nie ma takiego klienta.'));
                }

                // Jeśli znaleziono klienta, ale hasło się nie zgadza, powiadom użytkownika
                if (!bcrypt.compareSync(password, rows[0].HASLO))
                    return done(null, false, req.flash('loginMessage', 'Złe hasło.'));

                // Jeśli wszystko się zgadza, zwróć klienta
                return done(null, rows[0]);
            });
        })
    );

    // Logowanie pracownika
    passport.use(
        'local-login2',
        new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            // Znajdź pracownika o podanym emailu
            connection.query("SELECT * FROM pracownik WHERE EMAIL = ?",[email], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    // Jeśli nie znaleziono, wyślij powiadomienie
                    return done(null, false, req.flash('loginMessage', 'Nie ma takiego pracownika.')); // req.flash is the way to set flashdata using connect-flash
                }

                // Jeśli hasło się nie zgadza, wyślij powiadomienie
                if (!bcrypt.compareSync(password, rows[0].HASLO))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // Jeśli wszystko dobrze, zwróć pracownika
                return done(null, rows[0]);
            });
        })
    );
};
