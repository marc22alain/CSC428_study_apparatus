/*****************************************************************
	24 Parcticipants, each going through a unique Experiment.
	36 Tweets, randomly and evenly distributed throughout the Experiments
	6 slots for each Experiment, each holding 6 Tweets, and each being presented by one method
	NEW STRATEGY !
*****************************************************************/

var fs = require('fs');

var numExperiments = 24;

var numSets = 6;

var numTweets = 36;

var experimentsList = [];

var tweetsList = [];

function Tweet() {
	this.number = 0;
	this.setTokens = {
		set1: 4,
		set2: 4,
		set3: 4,
		set4: 4,
		set5: 4,
		set6: 4
	};
};

var makeTweets = function() {
	for (var i = 0; i < numTweets; i++) {
		var tweet = new Tweet();
		tweet.number = i;	// 'Cause the array of Tweet._id's will start at 0
		tweetsList.push(tweet);
	}
};

function Experiment() {
	this.number = 1;
	this.suite = {
		set1: [],
		set2: [],
		set3: [],
		set4: [],
		set5: [],
		set6: []
	};
};

var setList = ['set1', 'set2', 'set3', 'set4', 'set5', 'set6'];
var suiteKeys = ['set1', 'set2', 'set3', 'set4', 'set5', 'set6'];

var makeExperiment = function() {
	// create a new experiment object
	var experiment = new Experiment();
	experiment.number += experimentsList.length;

	// Go through each Tweet in turn, #1 to #36

	for (var i = 0; i < numTweets; i++) {
		var picked = false;
		var loops = 0;
		while (!picked) {
			var setNum = Math.floor(Math.random() * 6);
			var setName = setList[setNum];
			// console.log('suiteKeys[setNum] is ' + suiteKeys[setNum]);
			if (tweetsList[i].setTokens[setName] > 0 && experiment.suite[setName].length < 6) {
				// Add this Tweet's number to the new Experiment's specified set
				experiment.suite[setName].push(tweetsList[i].number);

				// Then decrement the Tweet's tokens for that set
				tweetsList[i].setTokens[setName]--;
				picked = true;
			}
			else {
				// console.log('stuck at Tweet ' + tweetsList[i].number);
				// console.log('for Experiment ' + experiment);
				if (loops > 10000) {
					for (set in tweetsList[i].setTokens) {
						if (tweetsList[i].setTokens[set] === 0) {
							tweetsList[i].setTokens[set]++;
						}
					}
				}
				loops++;
				continue;
			}
		}
	}
	experimentsList.push(experiment);
	// console.log(experiment.number);
	// console.log(tweetsList);
};

makeTweets();
for (var i = 0; i < numExperiments; i++) {
	makeExperiment();	
}

/*******************************************************/

function Distribution() {
	this.set = {
		'0':0,
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
		'12':0,
		'13':0,
		'14':0,
		'15':0,
		'16':0,
		'17':0,
		'18':0,
		'19':0,
		'20':0,
		'21':0,
		'22':0,
		'23':0,
		'24':0,
		'25':0,
		'26':0,
		'27':0,
		'28':0,
		'29':0,
		'30':0,
		'31':0,
		'32':0,
		'33':0,
		'34':0,
		'35':0
	};
};

var plotDistribution = function(experimentsList) {
	var distributionList = [];

	for (var j = 0; j < numSets; j++) { 
		distributionList.push(new Distribution());
	}

	for (var j = 0; j < numSets; j++) {
		var distribution = distributionList[j];
		for (var i = 0; i < numExperiments; i++) {
			var experiment = experimentsList[i];
			// console.log(experiment);
			var slot = experiment.suite[suiteKeys[j]];
			// What did you do here ?
			distribution.set[slot[0]] += 1;
			distribution.set[slot[1]] += 1;
			distribution.set[slot[2]] += 1;
			distribution.set[slot[3]] += 1;
			distribution.set[slot[4]] += 1;
			distribution.set[slot[5]] += 1;
			}
	}

	return distributionList;
};

// console.log(plotDistribution(experimentsList));

var evaluateDistribution = function(distributionList, minimum, maximum) {
	for (var j = 0; j < numSets; j++) {
		var distribution = distributionList[j];

		for(var slot in distribution.set) {
			if (distribution.set[slot] < minimum || distribution.set[slot] > maximum) {
				return false;
			}
		}

	}

	return true;
}

var minimumCrit = 3;
var maximumCrit = 7;

var newDistribution = plotDistribution(experimentsList);

var distributionIsEven = evaluateDistribution(newDistribution, minimumCrit, maximumCrit);

if (distributionIsEven) {
	console.log(newDistribution);
}
else {
	console.log('false');
}



while (!distributionIsEven) {
	experimentsList = [];
	tweetsList = [];
	makeTweets();
	for (var i = 0; i < numExperiments; i++) {
		makeExperiment();	
	}

	newDistribution = plotDistribution(experimentsList);

	distributionIsEven = evaluateDistribution(newDistribution, minimumCrit, maximumCrit);
}

console.log('newDistribution');

var saveExperiments = function(experimentsList) {
	var stringJSON = JSON.stringify(experimentsList);
	var newFileName = 'experiments_chart.json';
	var newFile = fs.openSync(newFileName, 'w');
	fs.writeSync(newFile, stringJSON);
}

saveExperiments(experimentsList);
console.log(newDistribution);


