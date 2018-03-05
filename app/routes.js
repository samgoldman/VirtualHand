var pug = require('pug');
var path = require('path');
var fs = require('fs');
var Course = require('./models/course').model;
var Enrollment = require('./models/enrollment').model;

module.exports = function(app, passport) {
    const studentHomePage = pug.compileFile('./app/views/student_home.pug', undefined);
    const teacherHomePage = pug.compileFile('./app/views/teacher_home.pug', undefined);
    const genericHomePage = pug.compileFile('./app/views/generic_home.pug', undefined);
    const landingPage = pug.compileFile('./app/views/landing.pug', undefined);
    const loginPage = pug.compileFile('./app/views/login.pug', undefined);
    const signupPage = pug.compileFile('./app/views/signup.pug', undefined);
    const passwordRecoveryPage = pug.compileFile('./app/views/password_recovery.pug', undefined);

    var dingFilepath = path.join(__dirname + '/../client/static/ding.wav');
    var stlLogoFilepath = path.join(__dirname + '/../client/static/stl_logo.png');
    var vhLogoFilepath = path.join(__dirname + '/../client/static/vh_logo.png');

    app.get('/home', isLoggedIn, function(req, res){
        var result = Enrollment.getEnrolled(req.user)
            .then(function(enrolled) {
                if (enrolled.length > 0)
                    res.send(renderStudentHome(req));
                else
                    return Course.taughtBy(req.user);
            });

        if (result) {
            result.then(function(courses) {
                if (courses.length > 0)
                    res.send(renderTeacherHome(req, courses));
                else
                    res.send(renderGenericHome(req));
            });
        }
    });

    app.get('/logout', isLoggedIn, function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/', function(req, res) {
        res.send(landingPage({
        }));
    });

    app.get('/login', isNotLoggedIn, function(req, res) {
        res.send(pug.renderFile('./app/views/login.pug', {
            message : req.flash('loginMessage')
        }));
    });

    app.post('/login', isNotLoggedIn, passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure home section
        failureRedirect : '/login', // redirect back to the login page if there is an error
        failureFlash : true
    }));

    app.get('/signup', isNotLoggedIn, function(req, res) {
        // render the page and pass in any flash data if it exists
        res.send(signupPage( {
            message : req.flash('signupMessage')
        }));
    });

    app.post('/signup', isNotLoggedIn, passport.authenticate('local-signup', {
        successRedirect : '/home', // redirect to the secure home section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true
    }));

    app.get('/recoverpassword', isNotLoggedIn, function(req, res) {
        res.send(passwordRecoveryPage({}));
    });

    app.get('/stl_logo', function(req, res) {
        res.set({
            'Content-Type' : 'image/png'
        });
        var readStream = fs.createReadStream(stlLogoFilepath);
        readStream.pipe(res);
    });

    app.get('/vh_logo', function(req, res) {
        res.set({
            'Content-Type' : 'image/png'
        });
        var readStream = fs.createReadStream(vhLogoFilepath);
        readStream.pipe(res);
    });

    app.get('/notification_audio', function(req, res) {
        res.set({
            'Content-Type' : 'audio/mpeg'
        });
        var readStream = fs.createReadStream(dingFilepath);
        readStream.pipe(res);
    });

    function renderStudentHome(req){
        return studentHomePage({
            user : req.user
        });
    }

    function renderTeacherHome(req, courses){
        var renderData = {};
        renderData.user = req.user;
        renderData.courses = courses;

        return pug.renderFile('./app/views/teacher/teacher_home.pug', renderData);
    }

    function renderGenericHome(req){
        return genericHomePage({
            user : req.user
        });
    }
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