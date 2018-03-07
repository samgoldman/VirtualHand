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

// create the model for users and expose it to our app
module.exports = {
	model: mongoose.model('Course', courseSchema)
};