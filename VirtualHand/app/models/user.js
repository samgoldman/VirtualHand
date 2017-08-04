// app/models/user.js
// load the things we need
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var Class = require('./class');
var deepPopulate = require('mongoose-deep-populate');

// define the schema for our user model
var userSchema = mongoose.Schema({

	username : String,
	password : String,
	email : String,
	student_classes : [{type : Schema.Types.ObjectId, ref: 'Class'}],
	teacher_classes : [{type : Schema.Types.ObjectId, ref: 'Class'}],
	metaData : [{
	    name : String,
	    message : String,
	    sent : Boolean
	     }],
	last_login : String,
	time_stamp : {type: Date, default: Date.now},
	
	is_admin : Boolean, // Use more
	is_student : Boolean, // Implement
	is_teacher : Boolean, // Implement

	school : String, // Eventually Delete
});

userSchema.pre('save', function(next){
	  now = new Date();
	  this.time_stamp = now;
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
module.exports = mongoose.model('User', userSchema);