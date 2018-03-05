// app/models/hallPassRequest.js
// load the things we need
var mongoose = require('mongoose');
var User = require('./user');
var Course = require('./course');

// define the schema for our user model
var hallPassRequestSchema = mongoose.Schema({
    requestTime: {type: Date, default: Date.now},
    student: {type : mongoose.Schema.Types.ObjectId, ref : 'User'},
    course: {type : mongoose.Schema.Types.ObjectId, ref : 'Course'},
    resolved: Boolean,
    timestamp: {type: Date, default: Date.now}
});

hallPassRequestSchema.pre('save', function(next){
    this.timestamp = new Date();
    next();
});

// create the model for users and expose it to our app
module.exports = {
    model: mongoose.model('HallPassRequest', hallPassRequestSchema),
};