const express = require('express');
const app = express();
var passport = require('passport');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var express_session = require('express-session');
var serve_static = require('serve-static');
var cookie_parser = require('cookie-parser');
var body_parser = require('body-parser');
const mongoStore = require('connect-mongo')(express_session);

var port = process.env.PORT;
var mongoURL = process.env.MONGODB_URI || process.env.MONGO_URL;

mongoose.Promise = Promise;
mongoose.connect(mongoURL, {
    useMongoClient : true
});

require('./app/passport')(passport);

app.use(express_session({
	secret : '0ENc9dVBMWH6VzpkXppojOakPBPy7g8ZRTEkUkZCrcyhynYqyr48FBp1W0fx',
    store : new mongoStore({
        mongooseConnection : mongoose.connection
    }), // connect-mongo session store
    proxy : true,
    resave : true,
    name: 'sessionID',
    saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(cookie_parser()); // read cookies (needed for auth)
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true })); // get information from html forms
app.use(serve_static(__dirname + '/public'));
app.use(serve_static(__dirname + '/client/static/favicon'));

require('./app/routes.js')(app, passport);

var server = require('http').createServer(app);

var io = require('socket.io')(server);
require('./app/io.js')(io);

server.listen(port, function () {
  console.log('Example app listening on port '+port+'!')
});

var User = require('./app/models/user').model;

User.findOne({
	'username' : 'admin'
}, function(err, user) {
	// if there are any errors, log the error
	if (err) {
		return;
	}

	// check to see if there's already a user with that email
	if (user) {

	} else {
		var newUser = new User();
		
		// set the admin's credentials
		newUser.username = 'admin';
		// All admins should change this password right away
		newUser.password = newUser.generateHash(process.env.ADMIN_INITIAL_PASSWORD);
		newUser.is_admin = true;

		// save the user
		newUser.save(function(err) {console.log(err)});
	}

});