// app/models/course.js
// load the things we need
let mongoose = require('mongoose');
let User = require('./user');

// define the schema for our user model
let courseSchema = mongoose.Schema({
    courseName: String,
    courseKey: String,
    teacher : {type : mongoose.Schema.Types.ObjectId, ref : 'User'},
    timestamp: {type: Date, default: Date.now}
});

courseSchema.pre('save', function(next){
    this.timestamp = new Date();
    next();
});

courseSchema.statics.taughtBy = function taughtBy(user) {
	let Course = this;
	return Course.find({teacher: user._id}).sort('courseName');
};

// Generate a random 6-7 character key
courseSchema.statics.generateCourseKey = function generateCourseKey() {
	return (Math.floor(Math.random() * 1000000000) + parseInt(Date.now() / 1000)).toString(36).toUpperCase().substring(0, 6);
};

// create the model for users and expose it to our app
module.exports = {
	model: mongoose.model('Course', courseSchema)
};