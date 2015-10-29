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

// start with wiping the Experiment collection
schema.Experiment.remove({}, function(err) {
	if (err) {
		console.log(err);
	}
	else {
	    console.log('collection removed!');		
	}
});

var file = fs.readFileSync('./experiments/experiments_chart_min_3_max_7.json');

schema.makeExperiments(JSON.parse(file), function() {
	mongoose.disconnect(function(err) {
		if (err) {
			console.log('OOPS! Could not close DB due to', err);		
		}
		else {
			console.log('DB is now closed');
		}
	});
});