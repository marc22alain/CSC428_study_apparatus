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

// exports.tweetByNum = function(tweetNum, callback) {
//     Tweet.find().where('number').equals(Number(tweetNum)).exec(function(err, result) {
//         if (err) {
//             // TODO: implement good error notification
//             console.log('error is ', err);
//         } else {
//             console.log('tweet for ' + result[0].number + ' was found.');
//             if (callback) {
//                 var jsonPath = JSON.parse(result[0].path);
//                 // console.log('jsonPath is type ', typeof(jsonPath));
//                 callback(jsonPath);
//             }
//         }
//     })
// };

// exports.tweetList = function(req, callback) {
//     var keyName = Object.keys(req.query)[0];
//     var val = req.query[keyName];

//     var handleResults = function(err, results) {
//         if (err) {
//             // TODO: implement good error notification
//             console.log('error is ', err);
//         } else {
//             console.log('resuts are ', results);
//             var mapsJoin = {
//                 type: "FeatureCollection",
//                 features: []
//             }
//             for (var i = 0; i < results.length; i++) {
//                 var jsonPath = JSON.parse(results[i].path);
//                 mapsJoin.features.push(jsonPath.features[0]);
//             }
//             callback(mapsJoin);
//             // TODO: turn this into serving all tweet
//             console.log("number of tweet in DB is ", results.length);
//         }
//     };

//     switch (keyName) {
//         case 'number':
//             Tweet.find({
//                 'number': val
//             }).exec(handleResults);
//             break;
//         case 'province':
//             Tweet.find({
//                 'province': val
//             }).exec(handleResults);
//             break;
//     }
// };