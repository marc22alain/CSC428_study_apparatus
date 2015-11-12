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

// start with wiping the Tweet collection
// schema.Tweet.remove({}, function(err) {
// 	if (err) {
// 		console.log(err);
// 	}
// 	else {
// 	    console.log('collection removed!');		
// 	}
// });

var files = fs.readdirSync('tweets');
// console.log(files);

var count = files.length;

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

var pattern = /tweet/;

for (var i=0; i < files.length; i++) {
	var fileName = 'tweets/' + files[i];
	if (fileName.match(pattern)) {
		var tweetFile = fs.readFileSync(fileName);
		console.log('Num files is ' + files[i]);
		schema.createTweet(tweetFile, false, countDown);
	}
}