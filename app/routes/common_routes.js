module.exports = function(app){
	
	// =====================================
	// HOME ================================
	// =====================================
	app.get('/home', isLoggedIn, function(req, res) {
		if (req.user.is_admin) {
			res.redirect('/admin_home');
		}
		if (req.user.is_student) {
			res.redirect('/student_home');
		}
		if (req.user.is_teacher) {
			res.redirect('/teacher_home');
		}
	});
	
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', isLoggedIn, function(req, res) {
		req.logout();
		res.redirect('/');
	});
}

//route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/login');
}