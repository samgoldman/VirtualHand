// app/models/course.js
// load the things we need
var mongoose = require('mongoose');
var User = require('./user');

// define the schema for our user model
var courseSchema = mongoose.Schema({
    courseName: String,
    courseKey: String,
    teacher : [{type : mongoose.Schema.Types.ObjectId, ref : 'User'}],
    timestamp: {type: Date, default: Date.now}
});

courseSchema.pre('save', function(next){
	  this.timestamp = new Date();
	  next();
});

// create the model for users and expose it to our app
module.exports = { model: mongoose.model('Course', courseSchema)};