const isLoggedIn = (req, res, next) => {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/login');
}

const isNotLoggedIn = (req, res, next) => {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
		res.redirect('/home');
	} else {
		return next();
	}
}

// If the user is a teacher, continue,
// Otherwise, redirect them home
const isTeacher = (req, res, next) => {
	if(req.user.role === 'teacher')
		return next();
	res.redirect('/home');
}

// If the user is a student, continue,
// Otherwise, redirect them home
const isStudent = (req, res, next) => {
	if(req.user.role === 'student')
		return next();
	res.redirect('/home');
}


module.exports = {
    isLoggedIn: isLoggedIn,
    isNotLoggedIn: isNotLoggedIn,
    isTeacher: isTeacher,
    isStudent: isStudent
};