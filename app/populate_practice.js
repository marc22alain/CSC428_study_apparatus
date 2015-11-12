var fs = require('fs');
var	mongoose = require('mongoose');
var	schema = require('./schema');

var localDB = 'mongodb://localhost/CSC428';
var hostedDB = 'mongodb://heroku_pfgs482g:oru1ndak8cke7sl335s2ginheu@ds061148.mongolab.com:61148/heroku_pfgs482g';

mongoose.connect(localDB, function(err) {
	if (err) {
		console.log('OOPS! ', err);		
	}
	else {
		console.log('DB is good to go');
	}
});


var files = fs.readdirSync('tweets_practice');
// console.log(files);

var count = files.length;

var disconnect = function() {
	mongoose.disconnect(function(err) {
		if (err) {
			console.log('OOPS! Could not close DB due to', err);		
		}
		else {
			console.log('DB is now closed');
		}
	});
}

var countDown = function() {
	count--;
	console.log('count is now ' + count);
	if (count === 0) {
		schema.makePracticeExperiment(disconnect);
	}
};

var pattern = /tweet/;

// for (var i=0; i < files.length; i++) {
// 	if (files[i].match(pattern)) {
// 		var fileName = 'tweets_practice/' + files[i];
// 		var tweetFile = fs.readFileSync(fileName);
// 		schema.createTweet(tweetFile, true, countDown);			
// 	}
// }

schema.makePracticeExperiment(disconnect);
