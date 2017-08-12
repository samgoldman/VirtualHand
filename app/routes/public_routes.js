var pug = require("pug");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

module.exports = function(app, passport){
	
	// =====================================
	// RENDERINGS ==========================
	// =====================================
	const landingPage = pug.compileFile('./client/pug/landing.pug');
	const loginPage = pug.compileFile('./client/pug/login.pug');
	const signupPage = pug.compileFile('./client/pug/signup.pug');
	const passwordRecoveryPage = pug.compileFile('./client/pug/password_recovery.pug');
	// ====================================
	
	

	// =====================================
	// HOME PAGE ===========================
	// =====================================
	app.get('/', function(req, res) {
		console.log('Test!')
		res.send(landingPage({ 
		}));
	});
	
	
	// =====================================
	// LOGIN ===============================
	// =====================================
	app.get('/login', isNotLoggedIn, function(req, res) {
		res.send(loginPage({ 
			message : req.flash('loginMessage') 
	    }));
	});

	// process the login form
	app.post('/login', isNotLoggedIn, passport.authenticate('local-login', {
		successRedirect : '/home', // redirect to the secure home section
		failureRedirect : '/login', // redirect back to the login page if there is an error
		failureFlash : true
	}));
	
	

	// =====================================
	// SIGNUP ==============================
	// =====================================
	app.get('/signup', isNotLoggedIn, function(req, res) {

		// render the page and pass in any flash data if it exists
		res.send(signupPage( {
			message : req.flash('signupMessage'),
		}));
	});

	// process the signup form
	app.post('/signup', isNotLoggedIn, passport.authenticate('local-signup', {
		successRedirect : '/home', // redirect to the secure home section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true
	}));
	
	
	app.get('/recoverpassword', isNotLoggedIn, function(req, res) {
		res.send(passwordRecoveryPage({
		}));
	});
}

function isNotLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
		res.redirect('/home');
	} else {
		return next();
	}
}