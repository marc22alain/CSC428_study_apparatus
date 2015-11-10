'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./error'),
    Schema = mongoose.Schema;


var ResultSchema = new Schema({
	participant: {
        type: Schema.ObjectId,
        ref: 'Participant'
    },
	parentTweet: {
        type: Schema.ObjectId,
        ref: 'Tweet'
    },
    answers: [{
    	question: String,
    	answer: String,
    	correct: Boolean,
    	time: Number
    }],
    score: Number,
    method: String
});

var Result = mongoose.model('Result', ResultSchema);


exports.createResult = function(resultObj, callback) {
    var result = new Result(resultObj);

    result.save(function (err, data) {
        if (err) {
            callback({ message: errorHandler.getErrorMessage(err)}, data);
        } else {
            callback(err, data);
        }
    });
};
