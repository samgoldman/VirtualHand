const pug = require('pug');
const path = require('path');
const fs = require('fs');
const Course = require('./models/course').model;
const Enrollment = require('./models/enrollment').model;
const HallPassRequest = require('./models/hallPassRequest').model;
const AssistanceRequest = require('./models/assistanceRequest').model;
const Token = require('./token_manager');
const {isLoggedIn, isNotLoggedIn, isTeacher, isStudent} = require('./route_methods/route_middleware');

const templates = {
	student_home: './app/views/student/student_home.pug',
	teacher_home: './app/views/teacher/teacher_home.pug',
	teacher_hall_pass: './app/views/teacher/teacher_hall_pass.pug',
	login: './app/views/login.pug',
	signup: './app/views/signup.pug',
	password_recovery: './app/views/password_recovery.pug',
	teacher_hall_pass_history: './app/views/teacher/teacher_history_hall_pass.pug',
	teacher_assistance_request_history: './app/views/teacher/teacher_history_assistance_request.pug'
};

const compiledTemplates = {};

function renderFile(filename, data) {
	if (process.env.VH_ENV === 'DEVELOPMENT') {
		return pug.renderFile(filename, data, undefined);
	} else {
		return compiledTemplates[filename](data);
	}
}

module.exports = function (app, passport) {
	fs.writeFileSync('./app/views/teacher/modules/hall_pass_list_item_template_compiled.js', pug.compileFileClient('./app/views/teacher/modules/hall_pass_list_item_template.pug', {name: "listItemTemplate"}));
	Object.keys(templates).map(k => templates[k]).map((val) => {compiledTemplates[val] = pug.compileFile(val, undefined)});


	app.get('/home', isLoggedIn, handle_home);

	app.get('/teacher/home', isLoggedIn, isTeacher, handle_teacher_home);

	app.get('/teacher/hallpass', isLoggedIn, isTeacher, handle_teacher_hallpass);

	app.get('/teacher/history/hallpass/:cid', isLoggedIn, isTeacher, handle_teacher_hallpass_history);

	app.get('/teacher/history/assistancerequest/:cid', isLoggedIn, isTeacher, handle_teacher_assistance_request_history);

	app.get('/student/home', isLoggedIn, isStudent, handle_student_home);

	app.get('/logout', isLoggedIn, handle_logout);

	app.get(['/', '/login'], isNotLoggedIn, handle_login);

	app.post('/login', isNotLoggedIn, passport.authenticate('local-login', {
		successRedirect: '/home', // redirect to the secure home section
		failureRedirect: '/login', // redirect back to the login page if there is an error
		failureFlash: true
	}));

	app.get('/signup', isNotLoggedIn, handle_signup_get);

	app.post('/signup', isNotLoggedIn, passport.authenticate('local-signup', {
		successRedirect: '/home', // redirect to the secure home section
		failureRedirect: '/signup', // redirect back to the signup page if there is an error
		failureFlash: true
	}));

	app.get('/recoverpassword', isNotLoggedIn, handle_recoverpassword);

	app.get('/notification_audio', handle_notification_audio);
};

const get_teacher_data = async (user) => {
	return {
		user: user,
		courses: await Course.taughtBy(user._id),
		token: Token.getSocketToken(user)
	};
};

const handle_teacher_home = async (req, res) => {
	res.send(renderFile(templates.teacher_home, await get_teacher_data(req.user)));
};

const handle_teacher_hallpass = async (req, res) => {
	res.send(renderFile(templates.teacher_hall_pass, await get_teacher_data(req.user)));
};

const handle_recoverpassword = (req, res) => {
	res.send(renderFile(templates.password_recovery, {
		token: Token.getSocketToken(null)
	}));
};

const handle_notification_audio = (req, res) => {
	res.set({'Content-Type': 'audio/ogg'});
	fs.createReadStream(path.join(__dirname, '../client/static/ding.ogg')).pipe(res);
};

const handle_home = (req, res) => {
    if (req.user.role === 'teacher') {
        res.redirect('/teacher/home');
    } else if (req.user.role === 'student') {
        res.redirect('/student/home');
    }
};

const handle_login = (req, res) => {
    res.send(renderFile(templates.login, {
        message: req.flash('loginMessage')
    }));
};

const handle_signup_get = (req, res) => {
	// render the page and pass in any flash data if it exists
	res.send(renderFile(templates.signup, {
		message: req.flash('signupMessage')
	}));
};

const handle_logout = (req, res) => {
	req.logout();
	res.redirect('/');
};

const handle_teacher_hallpass_history = async (req, res) => {
	await Course.verifyCourseTaughtBy(req.params.cid, req.user._id);
	
	res.send(renderFile(templates.teacher_hall_pass_history, {
		user: req.user,
		requests: await HallPassRequest.find({course: req.params.cid}).populate('student'),
		token: Token.getSocketToken(req.user)
	}));
};

const handle_teacher_assistance_request_history = async (req, res) => {
	await Course.verifyCourseTaughtBy(req.params.cid, req.user._id);
	
	res.send(renderFile(templates.teacher_assistance_request_history, {
		user: req.user,
		requests: await AssistanceRequest.find({course: req.params.cid}).populate('student'),
		token: Token.getSocketToken(req.user)
	}));
};

const handle_student_home = async (req, res) => {
	res.send(renderFile(templates.student_home, {
		user: req.user,
		enrollments: await Enrollment.find({student: req.user._id, valid: true, admitted: true}).populate('course'),
		token: Token.getSocketToken(req.user)
	}));
};