let pug = require('pug');
let path = require('path');
let fs = require('fs');
let Course = require('./models/course').model;
let Enrollment = require('./models/enrollment').model;
let Token = require('./token_manager');

module.exports = function (app, passport) {
	const studentHomePage = pug.compileFile('./app/views/student/student_home.pug', undefined);
	const teacherHomePage = pug.compileFile('./app/views/teacher/teacher_home.pug', undefined);
	const landingPage = pug.compileFile('./app/views/landing.pug', undefined);
	const loginPage = pug.compileFile('./app/views/login.pug', undefined);
	const signupPage = pug.compileFile('./app/views/signup.pug', undefined);
	const passwordRecoveryPage = pug.compileFile('./app/views/password_recovery.pug', undefined);

	let dingFilepath = path.join(__dirname + '/../client/static/ding.wav');
	let stlLogoFilepath = path.join(__dirname + '/../client/static/stl_logo.png');
	let vhLogoFilepath = path.join(__dirname + '/../client/static/vh_logo.png');

	app.get('/home', isLoggedIn, function (req, res) {
		if (req.user.role === 'teacher') {
			res.redirect('/teacher/home');
		} else if (req.user.role === 'student') {
			res.redirect('/student/home');
		}
	});

	app.get('/teacher/home', isLoggedIn, isTeacher, function(req, res) {
		Course.find({teacher: req.user._id}).sort('courseName')
			.then(function (courses) {
				let renderData = {
					user: req.user,
					courses: courses,
					token: Token.getSocketToken(req.user)
				};

				res.send(teacherHomePage(renderData));
			});
	});

	app.get('/student/home', isLoggedIn, isStudent, function(req, res) {
		Enrollment.find({student: req.user._id, valid: true, admitted: true}).populate('course')
			.then(function (enrollments) {
				let renderData = {
					user: req.user,
					enrollments: enrollments,
					token: Token.getSocketToken(req.user)
				};

				res.send(studentHomePage(renderData));
			});
	});

	app.get('/logout', isLoggedIn, function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		res.send(landingPage({}));
	});

	app.get('/login', isNotLoggedIn, function (req, res) {
		res.send(loginPage({
			message: req.flash('loginMessage')
		}));
	});

	app.post('/login', isNotLoggedIn, passport.authenticate('local-login', {
		successRedirect: '/home', // redirect to the secure home section
		failureRedirect: '/login', // redirect back to the login page if there is an error
		failureFlash: true
	}));

	app.get('/signup', isNotLoggedIn, function (req, res) {
		// render the page and pass in any flash data if it exists
		res.send(signupPage({
			message: req.flash('signupMessage')
		}));
	});

	app.post('/signup', isNotLoggedIn, passport.authenticate('local-signup', {
		successRedirect: '/home', // redirect to the secure home section
		failureRedirect: '/signup', // redirect back to the signup page if there is an error
		failureFlash: true
	}));

	app.get('/recoverpassword', isNotLoggedIn, function (req, res) {
		res.send(passwordRecoveryPage({
			token: Token.getSocketToken(null)
		}));
	});

	app.get('/stl_logo', function (req, res) {
		res.set({'Content-Type': 'image/png'});
		let readStream = fs.createReadStream(stlLogoFilepath);
		readStream.pipe(res);
	});

	app.get('/vh_logo', function (req, res) {
		res.set({'Content-Type': 'image/png'});
		let readStream = fs.createReadStream(vhLogoFilepath);
		readStream.pipe(res);
	});

	app.get('/notification_audio', function (req, res) {
		res.set({'Content-Type': 'audio/mpeg'});
		let readStream = fs.createReadStream(dingFilepath);
		readStream.pipe(res);
	});
};

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/login');
}

function isNotLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
		res.redirect('/home');
	} else {
		return next();
	}
}

// If the user is a teacher, continue,
// Otherwise, redirect them home
function isTeacher(req, res, next) {
	if(req.user.role === 'teacher')
		return next();
	res.redirect('/home');
}

// If the user is a student, continue,
// Otherwise, redirect them home
function isStudent(req, res, next) {
	if(req.user.role === 'student')
		return next();
	res.redirect('/home');
}