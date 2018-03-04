// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    googleId: String,
    username: String,
    timestamp: {type: Date, default: Date.now}
});

userSchema.pre('save', function(next){
	  this.timestamp = new Date();
	  next();
});

// create the model for users and expose it to our app
module.exports = { model: mongoose.model('User', userSchema)};