// app/models/user.js
// load the things we need
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var User = require('./user').model;
var Room = require('./room').model;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Promise = require('bluebird');

// define the schema for our user model
var handSchema = mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    hand_state: Boolean,
    admitted: Boolean,
    class_id: {type: Schema.Types.ObjectId, ref: 'Room'},
    time_stamp: {type: Date, default: Date.now}
});


handSchema.pre('save', function (next) {
    this.time_stamp = new Date();
    next();
});

handSchema.pre('remove', function (next) {
    var hand = this;
    hand.model('User').update(
        { student_classes: hand.class_id, _id: hand.user },
        { $pull: { student_classes: hand.class_id } },
        { multi: true },
        next);
});

handSchema.pre('remove', function(next){
    var hand = this;
    hand.model('Room').update(
        { hands: hand._id, _id: hand.class_id },
        { $pull: { hands: hand._id } },
        { multi: true },
        next);
});

handSchema.plugin(deepPopulate, {});

var handModel = mongoose.model('Hand', handSchema);

function getHandById(hand_id) {
    return Promise.cast(handModel.findById(hand_id).exec());
}

function getHandByIdAndRemove(hand_id) {
    return getHandById(hand_id).then(function(hand){
        hand.remove();
    });
}

function getHandByIdAndPopulate(hand_id, populate) {
    return Promise.cast(handModel.findById(hand_id).populate(populate).exec());
}

function getOneHand(query) {
    return Promise.cast(handModel.findOne(query).exec());
}

function saveHand(hand) {
    return Promise.cast(hand.save());
}

function getSortedHandsAndPopulate(classes, populate) {
    return Promise.cast(handModel.find()
        .or(classes)
        .sort({time_stamp: 'ascending'})
        .populate(populate)
        .exec());
}

function getHandsAndPopulate(classes, populate) {
    return Promise.cast(handModel.find()
        .or(classes)
        .populate(populate)
        .exec());
}

function createHand(user, hand_state, admitted, class_id){
    return Promise.cast(handModel.create({user: user, hand_state: hand_state, admitted: admitted, class_id: class_id}));
}

// create the model for users and expose it to our app
module.exports = {
    model: handModel,
    getHandById: getHandById,
    getHandByIdAndPopulate: getHandByIdAndPopulate,
    saveHand: saveHand,
    getOneHand: getOneHand,
    getHandByIdAndRemove: getHandByIdAndRemove,
    getSortedHandsAndPopulate: getSortedHandsAndPopulate,
    getHandsAndPopulate: getHandsAndPopulate,
    createHand: createHand
};