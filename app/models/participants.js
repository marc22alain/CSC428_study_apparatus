'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./error'),
    Schema = mongoose.Schema;

// TODO: implement time-to-answer in the Participant model

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
    results: {
        set1: [Boolean],
        set2: [Boolean],
        set3: [Boolean],
        set4: [Boolean],
        set5: [Boolean],
        set6: [Boolean]
    }
});

var Participant = mongoose.model('Participant', ParticipantSchema);

exports.createParticipant = function(partiObj, callback) {
    var participant = new Participant(partiObj);

    participant.save(function (err) {
        if (err) {
            callback({ message: errorHandler.getErrorMessage(err)}, participant);
        } else {
            callback(err, participant);
        }
    });
};


// exports.createParticipant = function(first, last, age, callback) {
//     var participant = new Participant({
//         firstName: first,
//         lastName: last,
//         age: age
//     });
//     participant.save(function (err) {
//         if (err) {
//             console.log('err ', err);
//             callback(err);
//         }
//         else {
//             console.log('Saved');
//             callback('OK');
//         }
//     });
// };