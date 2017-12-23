var pug = require('pug');
var path = require('path');
var fs = require('fs');

module.exports = function(app, passport) {
    const adminHomePage = pug.compileFile('./app/views/admin_home.pug', undefined);
    const studentHomePage = pug.compileFile('./app/views/student_home.pug', undefined);
    const teacherHomePage = pug.compileFile('./app/views/teacher_home.pug', undefined);
    const landingPage = pug.compileFile('./app/views/landing.pug', undefined);
    const loginPage = pug.compileFile('./app/views/login.pug', undefined);
    const signupPage = pug.compileFile('./app/views/signup.pug', undefined);
    const passwordRecoveryPage = pug.compileFile('./app/views/password_recovery.pug', undefined);

    var dingFilepath = path.join(__dirname + '/../client/static/ding.wav');
    var stlLogoFilepath = path.join(__dirname + '/../client/static/stl_logo.png');
    var vhLogoFilepath = path.join(__dirname + '/../client/static/vh_logo.png');

    app.get('/home', isLoggedIn, function(req, res){
        if (req.user.is_admin) {
            res.send(renderAdminHome(req));
        }
        if (req.user.is_student) {
            res.send(renderStudentHome(req));
        }
        if (req.user.is_teacher) {
            res.send(renderTeacherHome(req));
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
        res.send(loginPage({
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
        res.send(passwordRecoveryPage({
        }));
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

    function renderAdminHome(req){
        return adminHomePage({
            user : req.user,
            session : req.session,
            env : process.env.NODE_ENV
        });
    }

    function renderStudentHome(req){
        return studentHomePage({
            user : req.user,
            session : req.session
        });
    }

    function renderTeacherHome(req){
        var m_send = "";
        if (req.user.metaData) {
            for (var i = 0; i < req.user.metaData.length; i++) {
                if (!req.user.metaData[i].sent) {
                    m_send += req.user.metaData[i].message + " ";
                }
                req.user.metaData[i].sent = true;
            }
            req.user.save();
        }
        return teacherHomePage({
            user : req.user,
            session : req.session,
            message : m_send
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