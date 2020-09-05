// app/models/assistanceRequest.js
// load the things we need
let mongoose = require('mongoose');

// define the schema for our user model
let assistanceRequestSchema = mongoose.Schema({
	requestTime: {type: Date, default: Date.now},
	student: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
	resolved: Boolean,
	resolvedTime: {type: Date, default: null},
	resolved_type: String,
	timestamp: {type: Date, default: Date.now}
});

assistanceRequestSchema.pre('validate', function (next) {
	this.timestamp = new Date();
	next();
});

// create the model for users and expose it to our app
module.exports = {
	model: mongoose.model('AssistanceRequest', assistanceRequestSchema),
};
