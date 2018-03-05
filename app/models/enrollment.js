// app/models/enrollment.js
// load the things we need
var mongoose = require('mongoose');
var User = require('./user');
var Course = require('./course');

// define the schema for our user model
var enrollmentSchema = mongoose.Schema({
    requestTime: {type: Date, default: Date.now},
    student: {type : mongoose.Schema.Types.ObjectId, ref : 'User'},
    course: {type : mongoose.Schema.Types.ObjectId, ref : 'Course'},
    admitted: Boolean,
    timestamp: {type: Date, default: Date.now}
});

enrollmentSchema.pre('save', function(next){
    this.timestamp = new Date();
    next();
});

enrollmentSchema.statics.getEnrolled = function getEnrolled(user) {
    var Request = this;
    return Request.find({student : user._id});
};

// create the model for users and expose it to our app
module.exports = {
    model: mongoose.model('Enrollment', enrollmentSchema),
};