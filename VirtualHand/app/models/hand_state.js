// app/models/user.js
// load the things we need
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var User = require('./user');
var Class = require('./class');
var deepPopulate = require('mongoose-deep-populate');

// define the schema for our user model
var hand_StateSchema = mongoose.Schema({
	user : {type : Schema.Types.ObjectId, ref: 'User'},
	hand_state : Boolean,
	admitted : Boolean,
	class_id : {type : Schema.Types.ObjectId, ref : 'Class'},
	time_stamp : {type: Date, default: Date.now},
});

hand_StateSchema.pre('save', function(next){
	  now = new Date();
	  this.time_stamp = now;
	  next();
});

hand_StateSchema.plugin(deepPopulate, {});

// create the model for users and expose it to our app
module.exports = mongoose.model('Hand_State', hand_StateSchema);
