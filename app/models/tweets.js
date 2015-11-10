'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// TODO: update the model to hold the questions in an array

var TweetSchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true
    },
    tweet: {
        type: String,
        default: '',
        trim: true
    },
    author: {
        type: String,
        default: '',
        trim: true
    },
    date: {
        type: String,
        default: '',
        trim: true
    },
    tags: [{
        type: String,
        default: '',
        trim: true
    }],
    question1: {
        question: {
            type: String,
            default: '',
            trim: true
        },
        answers: [{
            type: String,
            default: '',
            trim: true
        }],
        correct: {
            type: String,
            default: '',
            trim: true
        }
    },
    question2: {
        question: {
            type: String,
            default: '',
            trim: true
        },
        answers: [{
            type: String,
            default: '',
            trim: true
        }],
        correct: {
            type: String,
            default: '',
            trim: true
        }
    },
    question3: {
        question: {
            type: String,
            default: '',
            trim: true
        },
        answers: [{
            type: String,
            default: '',
            trim: true
        }],
        correct: {
            type: String,
            default: '',
            trim: true
        }
    },
    question4: {
        question: {
            type: String,
            default: '',
            trim: true
        },
        answers: [{
            type: String,
            default: '',
            trim: true
        }],
        correct: {
            type: String,
            default: '',
            trim: true
        }
    },
    question5: {
        question: {
            type: String,
            default: '',
            trim: true
        },
        answers: [{
            type: String,
            default: '',
            trim: true
        }],
        correct: {
            type: String,
            default: '',
            trim: true
        }
    }
});

var Tweet = mongoose.model('Tweet', TweetSchema);

exports.Tweet = Tweet;

exports.createTweet = function(tweetFile, callback) {
    var tweetObject = JSON.parse(tweetFile);
    var tweet = new Tweet(tweetObject);
    tweet.save(function (err) {
        if (err) {
            console.log('err ', err);
        }
        else {
            console.log('Saved');
            callback();
        }
    });
};

exports.tweetById = function(tweetId, callback) {
    Tweet.findById(tweetId).exec(function(err, result) {
        if (err) {
            // TODO: implement good error notification
            console.log('error is ', err);
        } else {
            // console.log('tweet for ' + result.number + ' was found.');
            if (callback) {
                // var jsonPath = JSON.parse(result.path);
                // console.log('jsonPath is type ', typeof(jsonPath));
                callback(result);
            }
        }
    })
};

exports.tweetListInternal = function(callback) {
    Tweet.find().exec(function(err, results) {
        if (err) {
            console.log('OOPS! Error is ', err);
        } else {
            return callback(results);
        }
    });
};
