var pug = require("pug");

var Class = require('../models/class');

var io_host = process.env.VH_IO_HOST;

module.exports = function(app) {
	const homePage = pug.compileFile('./client/pug/teacher_home.pug');

	app.get('/teacher_home', isLoggedIn, isTeacher, function(req, res) {
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
		res.send(homePage({
			user : req.user,
			session : req.session,
			io_host : io_host,
			message : m_send
		}));
	});

	app.get("update_user", isLoggedIn, isTeacher, function(req, res) {
		User.findById(req.user.id).exec(function(err, user) {
			req.user = user;
		});
	});
}

function isTeacher(req, res, next) {
	if (req.user.is_teacher) {
		return next();
	}
	res.redirect('/home');
}

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/login');
}