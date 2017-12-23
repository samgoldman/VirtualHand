// app/models/user.js
// load the things we need
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var Room = require('./room').model;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for our user model
var userSchema = mongoose.Schema({

	username : String,
	password : String,
	email : String,
	student_classes : [{type : Schema.Types.ObjectId, ref: 'Room'}],
	teacher_classes : [{type : Schema.Types.ObjectId, ref: 'Room'}],
	metaData : [{
	    name : String,
	    message : String,
	    sent : Boolean
	     }],
	last_login : String,
	time_stamp : {type: Date, default: Date.now},
	
	is_admin : Boolean,
	is_student : Boolean,
	is_teacher : Boolean
});

userSchema.pre('save', function(next){
	  this.time_stamp = new Date();
	  next();
});

userSchema.plugin(deepPopulate, {});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = { model: mongoose.model('User', userSchema)};