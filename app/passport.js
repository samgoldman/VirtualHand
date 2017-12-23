// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('./models/user').model;

var localStrategyOptions = {
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
            .deepPopulate('teacher_classes student_classes teacher_classes.hands student_classes.hands teacher_classes.hands.user student_classes.hands.user')
            .exec()
            .then(function (user) {
                done(null, user);
            })
            .catch(function (err) {
                done(err);
                console.log(err);
                // TODO Log this error
            });
    });

    passport.use('local-signup', new LocalStrategy(localStrategyOptions, function (req, username, password, done) {
        User.findOne({'username': username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {
                var newUser = new User();

                newUser.username = username;
                newUser.password = newUser.generateHash(password);
                newUser.email = req.body.email;

                if (req.body.account_type === "student") {
                    return done(null, false, req.flash('signupMessage', 'You must select a school or create a new one if you are a teacher.'));
                } else {
                    if (req.body.account_type === "teacher") {

                        newUser.is_admin = false;
                        newUser.is_teacher = true;
                        newUser.is_student = false;
                    } else {
                        newUser.school = req.body.school;
                        newUser.is_admin = false;
                        newUser.is_teacher = false;
                        newUser.is_student = true;
                    }

                    newUser.save(function (err) {
                        if (err) {
                            return done(err, newUser);
                        } else {
                            return done(null, newUser);
                        }
                    });
                }

            }

        });
    }));

    passport.use('local-login', new LocalStrategy(localStrategyOptions, function (req, username, password, done) {
        User.findOne({'username': username})
            .exec()
            .then(function (user) {
                if (!user || !user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'That username/password combination does not exist.'));
                }
                user.last_login = Date.now();
                user.save();
                return done(null, user);
            })
            .catch(function (err) {
                done(err);
                // TODO Log this error
            });
    }));
};
