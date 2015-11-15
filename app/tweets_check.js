var fs = require('fs');
var _ = require('lodash');

var tweetFile = fs.readFileSync('./tweets/tweets_42.json');

var tweetsObj = JSON.parse(tweetFile)

console.log(tweetsObj.length);

for (var i = 0, MAXi = tweetsObj.length; i < MAXi; i++) {
	var questions = tweetsObj[i].questions;
	if (questions.length !== 5) {
		console.log('OOS tweet # ' + (i + 1) + tweetsObj[i].tweet);
	}
	for (var j = 0, MAXj = questions.length; j < MAXj; j++) {
		var answer = questions[j].correct
		if (_.indexOf(questions[j].answers, answer) < 0) {
			console.log('OOS answer in tweet # ' + (i + 1) + ' ' + questions[j].question);
			console.log(answer);
			console.log(tweetsObj[i].tweet);
			console.log('****************************************')
		}

	}
}

console.log('Done');
