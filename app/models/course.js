// app/models/course.js
// load the things we need
const mongoose = require('mongoose');
const randomstring = require("randomstring");

// define the schema for our user model
const courseSchema = mongoose.Schema({
	courseName: String,
	courseKey: String,
	teacher: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	valid: {type: Boolean, default: true},
	timestamp: {type: Date, default: Date.now}
});

courseSchema.pre('validate', function (next) {
	this.timestamp = new Date();
	next();
});

courseSchema.statics.taughtBy = function taughtBy(uid) {
	return this.find({teacher: uid, valid: true}).sort('courseName');
};

courseSchema.statics.verifyCourseTaughtBy = function verifyCourseTaughtBy(cid, uid) {
	return this.find({_id: cid, teacher: uid, valid: true})
		.countDocuments()
		.then(function(count) {
			if (count <= 0) throw new Error('Teacher does not teach class!');
		});
};

// Generate a random 6 character key
courseSchema.statics.generateCourseKey = () => randomstring.generate(6);

// create the model for users and expose it to our app
module.exports = {
	model: mongoose.model('Course', courseSchema)
};
