/*****************************************************************
	We want to have 30 participants involved in the study, each being challenged twice with 6 different text presentation conditions.
	We have 12 tweets with which to do this, and we want to randomize the appearance of those 12 tweets within the study.
	Finally, we want to avoid any biases that might be inadvertently introduced by an uneven distribution of tweets among the
	presentation conditions. 

	This script creates 30 experiments by randomly assigning the 12 tweets to the presentation conditions. It also checks that the overall
	distribution of tweets to each presentation condition is within a certain criterion. This criterion is named as input argument 'minimum'
	in the function definition for 'evaluateDistribution'. The script will generate an experiment for 30 participants, then check the
	distribution of tweets. If it doesn't not meet the 'minimum' criterion, the experiment is discarded and the process repeated.

	Note that the probability of tight distributions is actually quite low. A perfectly equal distribution would have each tweet appear 5 times
	in each presentation condition. A 'minimum' criterion of 2 is instantly met, while a 'minimum' criterion of 3 takes several seconds of
	processing to find. A 'minimum' criterion of 4 appears to be quite difficult to achieve. Therefore, a 'maximum' criterion is also set,
	to reduce the upper distribution tail. A 'maximum' criterion of 7 runs in reasonable time when the 'minimum' criterion is set to 3.
*****************************************************************/
var fs = require('fs');


var numExperiments = 30;

var numSlots = 6;

var numTweets = 12;

var distributionIsEven = false;

function Experiment() {
	this.slotsList = [];
};

function Slot() {
	this.tweetsList = [];
};

function Distribution() {
	this.set = {
		'1':0,
		'2':0,
		'3':0,
		'4':0,
		'5':0,
		'6':0,
		'7':0,
		'8':0,
		'9':0,
		'10':0,
		'11':0,
		'12':0
	};
};

var makeExperiment = function() {
	var experimentsList = [];

	for (var i = 0; i < numExperiments; i++) {
		var tweets = [1,2,3,4,5,6,7,8,9,10,11,12];

		var experiment = new Experiment();

		for (var j = 0; j < numSlots; j++) {
			var slot = new Slot();

			for (var k = 0; k < 2; k++) {
				var pick = Math.round((Math.random() * tweets.length + 0.5));
				// console.log(pick);
				slot.tweetsList.push(tweets.splice(pick - 1, 1)[0]);
			}

			experiment.slotsList.push(slot);
			// console.log(slot.tweetsList);
		}

		experimentsList.push(experiment);

	}

	return experimentsList;
}

var plotDistribution = function(experimentsList) {
	var distributionList = [];

	for (var j = 0; j < numSlots; j++) { 
		distributionList.push(new Distribution());
	}

	for (var j = 0; j < numSlots; j++) {
		var distribution = distributionList[j];
		for (var i = 0; i < numExperiments; i++) {
			var experiment = experimentsList[i];
				var slot = experiment.slotsList[j];
				distribution.set[slot.tweetsList[0]] += 1;
				distribution.set[slot.tweetsList[1]] += 1;
			}
	}

	return distributionList;
}

var evaluateDistribution = function(distributionList, minimum, maximum) {
	for (var j = 0; j < numSlots; j++) {
		var distribution = distributionList[j];

		for(var slot in distribution.set) {
			if (distribution.set[slot] < minimum || distribution.set[slot] > maximum) {
				return false;
			}
		}

	}

	return true;
}

var saveExperiments = function(experimentsList) {
	var stringJSON = JSON.stringify(experimentsList);
	var newFileName = 'experiments_chart.json';
	var newFile = fs.openSync(newFileName, 'w');
	fs.writeSync(newFile, stringJSON);
}

var newExperiment;

var newDistribution;

while (!distributionIsEven) {
	newExperiment = makeExperiment();

	newDistribution = plotDistribution(newExperiment);

	distributionIsEven = evaluateDistribution(newDistribution, 3, 7);
}

saveExperiments(newExperiment);

console.log(newDistribution);

