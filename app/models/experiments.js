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
        // console.log(result);
        var tweetList = result;

        for (var i = 0; i < experimentSet.length; i++) {
            var experiment = new Experiment();
            experiment.number = i;

            var suiteKeys = ['set1', 'set2', 'set3', 'set4', 'set5', 'set6'];

            var genSet = experimentSet[i].slotsList;

            for (var j = 0; j < suiteKeys.length; j++) {
                var tweet0 = tweetList[genSet[j].tweetsList[0] - 1];
                var tweet1 = tweetList[genSet[j].tweetsList[1] - 1];

                experiment.suite[suiteKeys[j]].push(tweet0);
                experiment.suite[suiteKeys[j]].push(tweet1);
            }

            experiment.save(function(err) {
                if (err) {
                    console.log('Error is ' + err);
                } else {
                    count--;
                    console.log('Experiment ' + (30 - count) + ' created!');
                    if (count === 0) {
                        callback();
                    }
                }
            });
        }
    });
};

exports.unusedExperiments = function(callback) {
    Experiment.find({status: 'unused'}).exec(function(err, results) {
        if (err) {
            console.log('OOPS! Error getting unused experiments is ', err);
            callback(err);
        } else {
            callback(err, results);
        }        
    });
};

exports.updateStatus = function(experiment, status, callback) {
    // experiment.status = status;
    console.log(experiment);
    Experiment.findById(experiment).exec(function(err, result) {
        console.log('Found experiment ' + result);
        result.status = status;
        result.save();
        callback(result);
    });
    // experiment.save();
}
