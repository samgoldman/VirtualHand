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
	const user = await User.findOne({'username': username}).exec();

	// Username is taken, do not continue
	if (user)
		return done(null, false, req.flash('signupMessage', 'That username is already taken.'));

	// Create the user
	const newUser = new User();
	newUser.username = username;
	newUser.password = newUser.generateHash(password);
	newUser.email = req.body.email;
	newUser.role = req.body.role;
	done(null, await newUser.save());
};

const loginStrategy = async (req, username, password, done) => {
	try {
		const user = await User.findOne({'username': username}).exec();
		if (!user || !user.validPassword(password))
			return done(null, false, req.flash('loginMessage', 'Incorrect credentials'));
		done(null, await user.save());
	} catch (err) {
		done(err);
	}
};

// expose this function to our app using module.exports
module.exports = function (passport) {
	passport.serializeUser(serializeUser);
	passport.deserializeUser(deserializeUser);
	passport.use('local-signup', new LocalStrategy(localStrategyOptions, signupStrategy));
	passport.use('local-login', new LocalStrategy(localStrategyOptions, loginStrategy));
};
