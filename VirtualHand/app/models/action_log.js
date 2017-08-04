// load the things we need
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

// define the schema for our action_log model
var action_LogSchema = mongoose.Schema({
	//Time stamp for when the action occured
	time_stamp : {type: Date, default: Date.now},
	//A short description of the action
	title : String,
	//Where the action was created
	author : String,
	//Current two states:
	//0 = action, no notificiation needed
	//1 = error, notify admins immediatly
	alert_level : Number,
	//The message for the actions
	message : String,
});

action_LogSchema.pre('save', function(next){
	  now = new Date();
	  this.time_stamp = now;
	  next();
});

action_LogSchema.plugin(deepPopulate, {});

// create the model for users and expose it to our app
module.exports = mongoose.model('Action_Log', action_LogSchema);