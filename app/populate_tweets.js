var fs = require('fs');
var	mongoose = require('mongoose');
var _ = require('lodash');
var	schema = require('./schema');

var localDB = 'mongodb://localhost/CSC428';
var hostedDB = 'mongodb://heroku_pfgs482g:oru1ndak8cke7sl335s2ginheu@ds061148.mongolab.com:61148/heroku_pfgs482g';

mongoose.connect(hostedDB, function(err) {
	if (err) {
		console.log('OOPS! ', err);		
	}
	else {
		console.log('DB is good to go');
	}
});

var tweetFile = fs.readFileSync('./tweets/tweets_42.json');

var tweetsObj = JSON.parse(tweetFile)

var count = tweetsObj.length;

var countDown = function() {
	count--;
	console.log('count is now ' + count);
	if (count === 0) {
		mongoose.disconnect(function(err) {
			if (err) {
				console.log('OOPS! Could not close DB due to', err);		
			}
			else {
				console.log('DB is now closed');
			}
		});
	}
};


for (var i = 0, MAX = tweetsObj.length; i < MAX; i++) {
	var stringObj = JSON.stringify(tweetsObj[i]);
	if (i < 36) {
		// create 36 records for the EXPERIMENT
		schema.createTweet(stringObj, false, countDown);		
	}
	else {
		// create 6 records for PRACTICE
		schema.createTweet(stringObj, true, countDown);
	}
}