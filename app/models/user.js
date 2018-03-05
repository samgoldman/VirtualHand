// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    timestamp: {type: Date, default: Date.now}
});

userSchema.pre('save', function(next){
	  this.timestamp = new Date();
	  next();
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = { model: mongoose.model('User', userSchema)};