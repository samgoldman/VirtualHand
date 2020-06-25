const express = require('express');
const app = express();
let passport = require('passport');
let flash = require('connect-flash');
let mongoose = require('mongoose');
let Promise = require('bluebird');
let express_session = require('express-session');
let serve_static = require('serve-static');
let cookie_parser = require('cookie-parser');
let body_parser = require('body-parser');
const mongoStore = require('connect-mongo')(express_session);

let port = process.env.PORT;
let mongoURL = process.env.MONGODB_URI || process.env.MONGO_URL;

mongoose.Promise = Promise;
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

require('./app/passport')(passport);

app.use(express_session({
	secret : process.env.SESSION_SECRET,
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
app.use(serve_static(`${__dirname}/public`));
app.use(serve_static(`${__dirname}/client/static/favicon`));
app.use('/js', serve_static(`${__dirname}/node_modules/bootstrap/dist/js`)); // redirect bootstrap JS
app.use('/js', serve_static(`${__dirname}/node_modules/jquery/dist`)); // redirect JS jQuery
app.use('/css', serve_static(`${__dirname}/node_modules/bootstrap/dist/css`)); // redirect CSS bootstrap
app.use('/css/fa', serve_static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/css`)); // redirect CSS fontawesome
app.use('/css/webfonts', serve_static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/webfonts`));

require('./app/routes.js')(app, passport);

let server = require('http').createServer(app);

let io = require('socket.io')(server);
require('./app/io.js')(io);

server.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
});
