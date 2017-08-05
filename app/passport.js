// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../app/models/user');

var ActionLog = require('../app/models/action_log')

var Handler = require('../app/action_log_handler');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	// used to deserialize the user
	passport
			.deserializeUser(function(id, done) {
				User
						.findById(id)
						.deepPopulate(
								'isEnabled disabledReason teacher_classes student_classes teacher_classes.hands student_classes.hands teacher_classes.hands.user student_classes.hands.user')
						.exec(
								function(err, user) {
									if (err) {

										var log = new Action_Log();
										log.title = "Database Error";
										log.message = "Error: " + err;
										log.author = "passport.js:deserializeUser:User.findById";
										log.alert_level = 1;
										Handler.handle_log(log);
										log.save();
									}
									done(err, user);
								});
			});

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for
	// signup
	// by default, if there was no name, it would just be called 'local'

	passport
			.use(
					'local-signup',
					new LocalStrategy(
							{
								usernameField : 'username',
								passwordField : 'password',
								passReqToCallback : true
							// allows us to pass back the entire request to the
							// callback
							},
							function(req, username, password, done) {

								// find a user whose email is the same as the
								// forms email
								// we are checking to see if the user trying to
								// login already exists
								User
										.findOne(
												{
													'username' : username
												},
												function(err, user) {
													// if there are any errors,
													// return the error
													if (err) {

														var log = new Action_Log();
														log.title = "Database Error";
														log.message = "Error: "
																+ err;
														log.author = "passport.js:local-signup:User.findById";
														log.alert_level = 1;
														Handler.handle_log(log);
														log.save();
														return done(err);
													}

													// check to see if theres
													// already a user with that
													// email
													if (user) {
														return done(
																null,
																false,
																req
																		.flash(
																				'signupMessage',
																				'That username is already taken.'));
													} else {

														// if there is no user
														// with that email
														// create the user
														var newUser = new User();

														// set the user's local
														// credentials
														newUser.username = username;
														newUser.password = newUser
																.generateHash(password);
														newUser.email = req.body.email;

														if ((req.body.newSchool == "" && req.body.school == "")
																|| (!req.body.newSchool && req.body.school == "")
																|| (req.body.account_type == "student" && req.body.school == "")) {
															return done(
																	null,
																	false,
																	req
																			.flash(
																					'signupMessage',
																					'You must select a school or create a new one if you are a teacher.'));
														} else {
															if (req.body.account_type == "teacher") {
																if (req.body.school != "") {
																	newUser.school = req.body.school;
																} else {
																	newUser.school = req.body.newSchool;
																}
																var d = new Date();

																newUser.is_admin = false;
																newUser.is_teacher = true;
																newUser.is_student = false;
															} else {
																newUser.school = req.body.school;
																newUser.is_admin = false;
																newUser.is_teacher = false;
																newUser.is_student = true;
															}

															newUser
																	.save(function(
																			err) {
																		if (err) {
																			var log = new Action_Log();
																			log.title = "Database Error";
																			log.message = "Error: "
																					+ err;
																			log.author = "passport.js:local-signup:newUser.save";
																			log.alert_level = 1;
																			Handler
																					.handle_log(log);
																			log
																					.save();

																			return done(
																					err,
																					newUser);
																		}
																		return done(
																				null,
																				newUser);
																	});
														}

													}

												});

							}));

	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================

	passport.use('local-login', new LocalStrategy({
		usernameField : 'username',
		passwordField : 'password',
		passReqToCallback : true
	// allows us to pass back the entire request to the
	// callback
	}, function(req, username, password, done) { // callback
		// with
		// email
		// and
		// password from our form

		// find a user whose email is the same as the
		// forms email
		// we are checking to see if the user trying to
		// login already exists
		User.findOne({
			'username' : username
		}, function(err, user) {
			// if there are any errors,
			// return the error before
			// anything else
			if (err) {

				var log = new Action_Log();
				log.title = "Database Error";
				log.message = "Error: " + err;
				log.author = "passport.js:local-login:User.findOne";
				log.alert_level = 1;
				Handler.handle_log(log);
				log.save();
				return done(err);
			}

			// if no user is found,
			// return the message
			if (!user || !user.validPassword(password))
				return done(null, false, req.flash('loginMessage',
						'Username/password combo doesn not exist.')); // req.flash
			// is
			// the
			// way
			// to
			// set
			// flashdata using
			// connect-flash

			if (user.is_teacher) {

				user.isAdmin = false;
				user.isTeacher = true;
				user.isStudent = false;
				user.save();
			}

			user.last_login = Date.now();
			user.save();

			// the
			// loginMessage
			// and save it to session as
			// flashdata

			// all is well, return
			// successful user
			return done(null, user);
		});

	}));
};
