var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
    tags: [String]
});

var Tweet = mongoose.model('Tweet', TweetSchema);

exports.createTweet = function(tweetFile) {
    var tweetObject = JSON.parse(tweetFile);
    var tweet = new Tweet({
        name: tweetObject.name,
        tweet: tweetObject.tweet,
        author: tweetObject.author,
        date: tweetObject.date,
        tags: tweetObject.tags
    });
    tweet.save(function (err) {
        if (err) {
            console.log('err ', err);
        }
        else {
            console.log('Saved');
        }
    });
};

exports.tweetByNum = function(tweetNum, callback) {
    Tweet.find().where('number').equals(Number(tweetNum)).exec(function(err, result) {
        if (err) {
            // TODO: implement good error notification
            console.log('error is ', err);
        } else {
            console.log('tweet for ' + result[0].number + ' was found.');
            if (callback) {
                var jsonPath = JSON.parse(result[0].path);
                // console.log('jsonPath is type ', typeof(jsonPath));
                callback(jsonPath);
            }
        }
    })
};

exports.tweetList = function(req, callback) {
    var keyName = Object.keys(req.query)[0];
    var val = req.query[keyName];

    var handleResults = function(err, results) {
        if (err) {
            // TODO: implement good error notification
            console.log('error is ', err);
        } else {
            console.log('resuts are ', results);
            var mapsJoin = {
                type: "FeatureCollection",
                features: []
            }
            for (var i = 0; i < results.length; i++) {
                var jsonPath = JSON.parse(results[i].path);
                mapsJoin.features.push(jsonPath.features[0]);
            }
            callback(mapsJoin);
            // TODO: turn this into serving all tweet
            console.log("number of tweet in DB is ", results.length);
        }
    };

    switch (keyName) {
        case 'number':
            Tweet.find({
                'number': val
            }).exec(handleResults);
            break;
        case 'province':
            Tweet.find({
                'province': val
            }).exec(handleResults);
            break;
    }
};