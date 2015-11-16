'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./error'),
    Tweet = require('./tweets'),
    Schema = mongoose.Schema;


var ExperimentSchema = new Schema({
    number: {
        type: Number
    },
    status: {
        type: String,
        enum: ['completed', 'in-process', 'unused'],
        default: 'unused'
    },
    suite: {
        set1: [{type: Schema.ObjectId, ref: 'Tweet'}],
        set2: [{type: Schema.ObjectId, ref: 'Tweet'}],
        set3: [{type: Schema.ObjectId, ref: 'Tweet'}],
        set4: [{type: Schema.ObjectId, ref: 'Tweet'}],
        set5: [{type: Schema.ObjectId, ref: 'Tweet'}],
        set6: [{type: Schema.ObjectId, ref: 'Tweet'}]
    }
});

var Experiment = mongoose.model('Experiment', ExperimentSchema);

exports.Experiment = Experiment;

exports.makeExperiments = function(experimentSet, callback) {
    var count = experimentSet.length;
    Tweet.tweetListInternal(function(result) {
        console.log(result);
        var tweetList = result;

        for (var i = 0; i < experimentSet.length; i++) {
            var experiment = new Experiment();
            experiment.number = i;

            var suiteKeys = ['set1', 'set2', 'set3', 'set4', 'set5', 'set6'];

            var genSet = experimentSet[i].suite;

            for (var j = 0; j < suiteKeys.length; j++) {
                var setName = suiteKeys[j];

                for (var k = 0; k < 6; k++ ) {
                    experiment.suite[setName].push(tweetList[genSet[setName][k]]);
                }
            }

            experiment.save(function(err) {
                if (err) {
                    console.log('Error is ' + err);
                } else {
                    count--;
                    console.log('Experiment ' + (24 - count) + ' created!');
                    if (count === 0) {
                        callback();
                    }
                }
            });
        }
    });
};

exports.unusedExperiments = function(callback) {
    Experiment.find( {status: 'unused'} ).exec(function(err, results) {
        if (err) {
            console.log('OOPS! Error getting unused experiments is ', err);
            callback(err);
        } else {
            callback(err, results);
        }        
    });
};

exports.updateStatus = function(experiment, status, callback) {
    Experiment.findById(experiment).exec(function(err, result) {
        console.log('Found experiment ' + result);
        result.status = status;
        result.save();
        callback(result);
    });
};

exports.getPracticeExperiment = function(callback) {
    Experiment.find({number: 100}).exec(function(err, result) {
        if (err) {
            console.log('OOPS! Error getting practice experiment is ', err);
            callback(err);
        } else {
            callback(err, result);
        }        
    });
};

exports.makePracticeExperiment = function(callback) {
    Tweet.tweetListPractice(function(result) {
        console.log(result);
        var tweetList = result;

            var experiment = new Experiment();

            // Arbitrary number - way out of range
            experiment.number = 100;

            var suiteKeys = ['set1', 'set2', 'set3', 'set4', 'set5', 'set6'];

            for (var j = 0; j < suiteKeys.length; j++) {
                var setName = suiteKeys[j];

                // Just one Tweet per set
                experiment.suite[setName].push(tweetList[j]);
            }

            experiment.save(function(err) {
                if (err) {
                    console.log('Error is ' + err);
                }
                else {
                    console.log('Practice experiment created!');
                    callback();
                }
            });
        
    });
};
