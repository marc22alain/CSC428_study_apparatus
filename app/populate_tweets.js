var fs = require('fs');
var	mongoose = require('mongoose');
var	schema = require('./schema');

var localDB = 'mongodb://localhost/CSC428';

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
// 	if (error) {
// 		console.log(err);
// 	}
// 	else {
// 	    console.log('collection removed!');		
// 	}
// });

var files = fs.readdirSync('tweets');
// console.log(files);

for (var i=0; i < files.length; i++) {
	var fileName = 'tweets/' + files[i];
	var tweetFile = fs.readFileSync(fileName);
	schema.createTweet(tweetFile);
}

console.log('Done saving tweet files');


// setTimeout(function() {
// 	// At time of writing, this line will print the number of documents in the Riding collection
// 	schema.ridingsList();

// 	// wait 15 seconds for all database saves to complete
// }, 15000);