// passport.js

// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const User = require('./models/user').model;

const localStrategyOptions = {
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
};

// Given a user, serialize it to it's ID
const serializeUser = (user, done) => done(null, user._id);

// Given a user ID, find a user object
const deserializeUser = async (id, done) => {
	const user = await User.findById(id);
	done(null, user);
};

const signupStrategy = async (req, username, password, done) => {
	const user = await User.findOne({'username': username});

	// Username is taken, do not continue
	if (user)
		return done(null, false, req.flash('signupMessage', 'That username is already taken.'));

	done(null, await User.create({username: username, password: User.generateHash(password), email: req.body.email, role: req.body.role}));
};

const loginStrategy = async (req, username, password, done) => {
	const user = await User.findOne({'username': username});
	if (!user || !user.validPassword(password))
		done(null, false, req.flash('loginMessage', 'Incorrect credentials'));
	else
		done(null, await user.save());
};

// expose this function to our app using module.exports
module.exports = function (passport) {
	passport.serializeUser(serializeUser);
	passport.deserializeUser(deserializeUser);
	passport.use('local-signup', new LocalStrategy(localStrategyOptions, signupStrategy));
	passport.use('local-login', new LocalStrategy(localStrategyOptions, loginStrategy));
};
