const express = require('express')
const app = express()

var passport = require('passport');
var flash = require('connect-flash');

var mongoose = require('mongoose');

var port = process.env.PORT;

var mongoURL = process.env.MONGODB_URI || process.env.MONGO_URL;
	
mongoose.connect(mongoURL);


require('./app/passport')(passport);

app.use(express.session({
	secret : '0ENc9dVBMWH6VzpkXppojOakPBPy7g8ZRTEkUkZCrcyhynYqyr48FBp1W0fx'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(express.cookieParser()); // read cookies (needed for auth)
app.use(express.json());
app.use(express.urlencoded()); // get information from html forms
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/client/static/favicon'));





var startup_time = new Date();
require('./app/routes/routes.js')(app, passport, startup_time);


var server = require('http').createServer(app);

var io = require('socket.io')(server);
require('./app/io.js')(io);

server.listen(port, function () {
  console.log('Example app listening on port '+port+'!')
});

var User = require('./app/models/user.js');

User.findOne({
	'username' : 'admin'
}, function(err, user) {
	// if there are any errors, log the error
	if (err) {
		return;
	}

	// check to see if theres already a user with that email
	if (user) {
		return;
	} else {
		var newUser = new User();
		
		// set the admin's credentials
		newUser.username = 'admin';
		// All admins should change this password right away
		newUser.password = newUser.generateHash(process.env.ADMIN_INITIAL_PASSWORD);
		newUser.is_admin = true;

		// save the user
		newUser.save(function(err) {});
	}

});