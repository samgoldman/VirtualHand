var pug = require('pug');
var fs = require('fs');



var io_host = process.env.VH_IO_HOST;

module.exports = function(app, startup_time){
	
	const homePage = pug.compileFile('./client/pug/admin_home.pug');
	
	app.get('/admin_home', isLoggedIn, isAdmin, function(req, res) {
		res.send(homePage({
			user : req.user,
			session : req.session,
			io_host : io_host,
			env : process.env.NODE_ENV
		}));
	});

	app.get('/get_log', isLoggedIn, isAdmin, function(req, res) {
		var readStream = fs.createReadStream('./' + req.query.q);
		readStream.pipe(res);
	});
	
	app.get('/app_log', isLoggedIn, isAdmin, function(req, res) {
		var readStream = fs.createReadStream('./app-'
				+ startup_time.valueOf() + '.log');
		readStream.pipe(res);
	});

	app.get('/debug_log', isLoggedIn, isAdmin, function(req, res) {
		var readStream = fs.createReadStream('./debug-'
				+ startup_time.valueOf() + '.log');
		readStream.pipe(res);
	});
	
	app.get('/user_cleanup', isLoggedIn, isAdmin, function(req, res){
		if (req.user.allowed_classes == -1){
			User.find({}, function(err, users) {

			    users.forEach(function(user) {
			    	//user.set('allowed_classes', undefined, {strict: false} );
			    	user.save();
			    });

			    res.send(userMap);  
		    });
			res.send("All Good!");
		} else{
			res.send("Uh Oh!");
		}
	});
}
	
function isAdmin(req, res, next){
	if(req.user.is_admin){
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