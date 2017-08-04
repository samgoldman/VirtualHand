var pug = require('pug');

var io_host = process.env.VH_IO_HOST;

module.exports = function(app){
const homePage = pug.compileFile('./client/pug/student_home.pug');
	
	app.get('/student_home', isLoggedIn, isStudent, function(req, res) {
		res.send(homePage({
			user : req.user,
			session : req.session,
			io_host : io_host,
		}));
	});
}

function isStudent(req, res, next){
	if(req.user.is_student){
		return next();
	}
	res.redirect('/home');
}

//route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/login');
}