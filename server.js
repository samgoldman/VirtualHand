const express = require('express');
const app = express();
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const express_session = require('express-session');
const serve_static = require('serve-static');
const cookie_parser = require('cookie-parser');
const body_parser = require('body-parser');
const mongoStore = require('connect-mongo')(express_session);
const rateLimit = require("express-rate-limit");

const port = process.env.PORT || 8080;
const mongoURL = process.env.MONGODB_URI || process.env.MONGO_URL;

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

app.set('trust proxy', 1);

// Limit certain requests to 5 per minute
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5
  });

app.use('/notification_audio', rateLimiter);
app.use('/teacher/history', rateLimiter);

app.use(flash());

app.use(cookie_parser()); // read cookies (needed for auth)
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true })); // get information from html forms
app.use(serve_static(`${__dirname}/public`));
app.use(serve_static(`${__dirname}/public/static/favicon`));
app.use('/js', serve_static(`${__dirname}/node_modules/bootstrap/dist/js`)); // redirect bootstrap JS
app.use('/js', serve_static(`${__dirname}/node_modules/jquery/dist`)); // redirect JS jQuery
app.use('/css', serve_static(`${__dirname}/node_modules/bootstrap/dist/css`)); // redirect CSS bootstrap
app.use('/css/fa', serve_static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/css`)); // redirect CSS fontawesome
app.use('/css/webfonts', serve_static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/webfonts`));

require('./app/routes.js')(app, passport);

const server = require('http').createServer(app);

const io = require('socket.io')(server);
require('./app/io_broadcaster').init(io);
require('./app/io.js')(io);

server.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
});

module.exports = {
    server: server
}