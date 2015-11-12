'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./error'),
    Schema = mongoose.Schema;

var ParticipantSchema = new Schema({
    firstName: {
        type: String,
        default: '',
        trim: true,
        required: 'Please provide a first name.'
    },
    lastName: {
        type: String,
        default: '',
        trim: true,
        required: 'Please provide a last name.'
    },
    age: {
        type: String,
        required: 'Please provide an age.'
    },
    experiment: {
        type: Schema.ObjectId,
        ref: 'Experiment'
    },
    practiced: {
        type: Number,
        default: 0
    }
});

var Participant = mongoose.model('Participant', ParticipantSchema);

exports.createParticipant = function(partiObj, callback) {
    var participant = new Participant(partiObj);

    participant.save(function (err, result) {
        if (err) {
            callback({ message: errorHandler.getErrorMessage(err)}, result);
        } else {
            callback(err, result);
        }
    });
};

exports.updateParticipant = function(participant, callback) {
    participant.save( function (err, result) {
        if (err) {
            callback({ message: errorHandler.getErrorMessage(err)}, result);
        } else {
            callback(err, result);
        }        
    });
}
