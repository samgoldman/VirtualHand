// passport.js

// load all the things we need
let LocalStrategy = require('passport-local').Strategy;

// load up the user model
let User = require('./models/user').model;

let localStrategyOptions = {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
};

// expose this function to our app using module.exports
module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id)
            .then(function (user) {
                done(null, user);
            });
    });

    passport.use('local-signup', new LocalStrategy(localStrategyOptions, function (req, username, password, done) {
        User.findOne({'username': username})
            .then(function(user) {
                if (user) return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            })
            .then(function() {
				let newUser = new User();
                newUser.username = username;
                newUser.password = newUser.generateHash(password);
                newUser.email = req.body.email;
				if (req.body.role === 'teacher') {
					newUser.role = 'teacher';
				} else if (req.body.role === 'student') {
					newUser.role = 'student';
				}

                return newUser.save();
            })
            .then(function(user) {
                 done(null, user);
            });
    }));

    passport.use('local-login', new LocalStrategy(localStrategyOptions, function (req, username, password, done) {
        User.findOne({'username': username})
            .exec()
            .then(function (user) {
                if (!user || !user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Incorrect credentials'));
                }
                user.save();
                return done(null, user);
            })
            .catch(function (err) {
                done(err);
                // TODO Log this error
            });
    }));
};
