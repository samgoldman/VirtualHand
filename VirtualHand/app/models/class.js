// app/models/user.js
// load the things we need
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var Hand_State = require('./hand_state');
var deepPopulate = require('mongoose-deep-populate');

// define the schema for our user model
var classSchema = mongoose.Schema({
	classname : String,
	hands : [{type : Schema.Types.ObjectId, ref: 'Hand_State'}],
	school : String,
	classKey : String,
	time_stamp : {type: Date, default: Date.now},
});

classSchema.pre('save', function(next){
	  now = new Date();
	  this.time_stamp = now;
	  next();
});

classSchema.plugin(deepPopulate, {});

// create the model for users and expose it to our app
module.exports = mongoose.model('Class', classSchema);
