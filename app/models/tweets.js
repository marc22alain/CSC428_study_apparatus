'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// TODO: update the model to hold the questions in an array

var TweetSchema = new Schema({
    tweet: {
        type: String,
        default: '',
        trim: true,
        required: 'No tweet text supplied'
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
    questions: [{
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
    }],
    practice: {
        type: Boolean,
        default: false
    }
});

var Tweet = mongoose.model('Tweet', TweetSchema);

exports.Tweet = Tweet;

exports.createTweet = function(tweetFile, practice, callback) {
    var tweetObject = JSON.parse(tweetFile);
    var tweet = new Tweet(tweetObject);
    tweet.practice = practice;
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
                callback(result);
            }
        }
    })
};

exports.tweetListInternal = function(callback) {
    Tweet.find({ practice:false }).exec(function(err, results) {
        if (err) {
            console.log('OOPS! Error is ', err);
        } else {
            return callback(results);
        }
    });
};

exports.tweetListPractice = function(callback) {
    Tweet.find({ practice: true }).exec(function(err, results) {
        if (err) {
            console.log('OOPS! Error is ', err);
        } else {
            return callback(results);
        }
    });
};