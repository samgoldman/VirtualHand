// app/models/user.js
// load the things we need
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var Hand = require('./hand').model;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for our user model
var roomSchema = mongoose.Schema({
	classname : String,
	hands : [{type : Schema.Types.ObjectId, ref: 'Hand'}],
	classKey : String,
	time_stamp : {type: Date, default: Date.now}
});

roomSchema.pre('save', function(next){
	  this.time_stamp = new Date();
	  next();
});

roomSchema.plugin(deepPopulate, {});

// create the model for users and expose it to our app
module.exports = { model: mongoose.model('Room', roomSchema)};
