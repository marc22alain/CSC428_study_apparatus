var fs = require('fs');
var http = require('http');
var	mongoose = require('mongoose');
var	schema = require('./schema');

var localDB = 'mongodb://localhost/CSC428';
var currentParticipant, currentExperiment, currentTweet, currentTweetNum = 0;

mongoose.connect(localDB, function(err) {
	if (err) {
		console.log('OOPS! ', err);		
	}
	else {
		console.log('DB is good to go');
	}
});

var port = 3000;

var state = 'ready', delayStart;

var server = http.createServer(function(req, response) {
	console.log(req.method + " request at " + req.url);

	// Three end-points serving pages:
	//		'/' providing simple buttons to direct to client reader or client tester
	//		'/reader.html'
	//		'/tester.html'

	// End-points providing study functions:
	//		'/status'	relates the sever's current status, allowing for client-reader to align its status in the event of upset
	//		'/participant'		will save a new participant to start an experiment
	//		'/start'		a signals from the client-tester to the server that the clients-reader is ready to start the readings
	//		'/text'		a request from the client-reader for the next reqding
	//		'/question'	a request from the client-tester for the next question/quiz
	//		'/answer'		will save a participant's answers to a quiz about a reading

	var handleResults = function(err, results) {
		if (err) {
			console.log('read failed');
			response.writeHead(500);
			response.write('SERVER ERROR');
			response.end();			
		}
		else {
			response.writeHead(200);
			response.write(results);
			response.end();	
		}
	};

	var parseResults = function(reqData) {
		console.log('' + reqData);
		var params = reqData.toString().split('&');
		var obj = new Object();
		for (var i = 0; i < params.length; i++) {
			var pair = params[i].split('=');
			obj[pair[0]] = pair[1];
		}
		console.log(obj);
		return obj;
	}


	if (req.url === '/styles.css') {
		fs.readFile('public/styles.css', handleResults);
	}
	else if (req.url === '/bootstrap-3.3.5-dist/css/bootstrap.min.css') {
		fs.readFile('public/bootstrap-3.3.5-dist/css/bootstrap.min.css', handleResults);
	}
	else if (req.url === '/bootstrap-3.3.5-dist/css/bootstrap-theme.min.css') {
		fs.readFile('public/bootstrap-3.3.5-dist/css/bootstrap-theme.min.css', handleResults);
	}
	else if (req.url === '/bootstrap-3.3.5-dist/js/bootstrap.min.js') {
		fs.readFile('public/bootstrap-3.3.5-dist/js/bootstrap.min.js', handleResults);
	}
	else if (req.url === '/jquery/jquery-2.1.4.js') {
		fs.readFile('public/jquery/jquery-2.1.4.js', handleResults);
	}
	else if (req.url === '/client-tester.js') {
		fs.readFile('public/client-tester.js', handleResults);
	}
	else if (req.url === '/client-reader.js') {
		fs.readFile('public/client-reader.js', handleResults);
	}
	else if (req.url === '/status') {
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write('{"state": "' + state + '"}');
		response.end();	
	}
	// else if (req.url === '/cancel') {
	// 	state = 'ready';
	// 	fs.readFile('public/tester.html', handleResults);
	// 	currentParticipant = null;
	// 	currentExperiment.status = 'unused';
	// 	currentExperiment.save();
	// 	currentExperiment = null;
	// }
	else {
		switch (state) {
			case 'ready':
				console.log('NOW in ' + state);
				if (req.url === '/') {
					fs.readFile('public/index.html', handleResults);
				}
				else if (req.url === '/reader.html') {
					fs.readFile('public/reader.html', handleResults);
				}
				else if (req.url === '/tester.html') {
					fs.readFile('public/tester.html', handleResults);
				}
				else if (req.url === '/participant') {

					schema.unusedExperiments(function(err, results) {
						if (err) {
							// What to do ? Highly unlikely...
						}
						else {
							req.on('data', function(data) {
								var participant = parseResults(data);
								participant.experiment = results[0];

								var process = function(err, participant) {
							        if (err) {
							            response.writeHead(400);
							            response.write(JSON.stringify(err));
							            response.end();
							        } else {
							            console.log('Participant Saved');

							            response.writeHead(200);
							            response.write(JSON.stringify(participant));
							            response.end();

							            currentParticipant = participant;

							            schema.updateStatus(participant.experiment, 'in-process', function(experiment) {
							            	currentExperiment = experiment;
							            });
							            state = 'wait-to-start';
							        }
								};

								schema.createParticipant(participant, process);
							});
						}
					});					
				}
				else if (req.url === '/text' || req.url === '/question') {
					response.writeHead(403);
					response.write('Request is out of order');
					response.end();			
				}
				else {
					response.writeHead(404);
					response.write('File not found - is it supposed to exist ?');
					response.end();			
				}
				break;


			case 'wait-to-start':
				console.log('NOW in ' + state);
				if (req.url === '/') {
					// Would actually be OK for either client to receive this again
					fs.readFile('public/index.html', handleResults);
				}
				else if (req.url === '/reader.html') {
					// CLient-reader has not yet received the text; present the READ button again
					fs.readFile('public/reader.html', handleResults);
				}
				else if (req.url === '/tester.html') {
					// Client-tester should re-populate with the currentParticipant
					fs.readFile('public/tester.html', handleResults);
				}
				else if (req.url === '/participant') {
					// Serve back the current participant
					response.writeHead(200);
					response.write(JSON.stringify(currentParticipant));
					response.end();
				}
				else if (req.url === '/start') {
					// Respond to AJAX from client-tester, initiating actual start
					response.writeHead(200);
					response.write('OK START');
					response.end();	
					
					state = 'wait-to-serve-text';					
				}
				else if (req.url === '/text' || req.url === '/question') {
					response.writeHead(403);
					response.write('Request is out of order');
					response.end();			
				}
				else {
					response.writeHead(404);
					response.write('File not found - is it supposed to exist ?');
					response.end();			
				}
				break;


			case 'wait-to-serve-text':
				console.log('NOW in ' + state);
				if (req.url === '/') {
					// Would actually be OK for either client to receive this again
					fs.readFile('public/index.html', handleResults);
				}
				else if (req.url === '/reader.html') {
					// CLient-reader has not yet received the text; present the READ button again
					fs.readFile('public/reader.html', handleResults);
				}
				else if (req.url === '/tester.html') {
					// Client-tester should re-populate with the currentParticipant
					fs.readFile('public/tester.html', handleResults);
				}
				else if (req.url === '/participant') {
					// Serve back the current participant
					response.writeHead(200);
					response.write(JSON.stringify(currentParticipant));
					response.end();
				}
				else if (req.url === '/text') {
					// Use a Latin Square to counter-balance the starting conditions; use currentExperiment.number % 6 !
					currentTweetNum++;
					var slot = ((Math.ceil(currentTweetNum / 2) - 1) + (currentExperiment.number % 6)) % 6;
		            var suiteKeys = ['set1', 'set2', 'set3', 'set4', 'set5', 'set6'];

					schema.tweetById(currentExperiment.suite[suiteKeys[slot]][currentTweetNum % 2], function(result) {
						// console.log(result);
						currentTweet = result;

						response.writeHead(200);
						response.write(JSON.stringify(currentTweet));
						response.end();

						// This is an AJAX call for text from the client-reader
						// TODO: define what text presentation method the client should use ... package it in the JSON
						state = 'served text';
						delayStart = Date.now();
						setTimeout(function() {
							state = 'wait-to-receive-answer';
						}, 10000);
					});
				}
				else if (req.url === '/question' || req.url === '/start') {
					// This is an AJAX call for question(s) from the client-tester
					// This should not be immediately available until XX seconds after the text has been served to the client-reader
					// Or, give intermediate stuff until the net state is reached... think about minimizing the number of end-points
					response.writeHead(403);
					response.write('Request is out of order');
					response.end();		
				}
				else {
					response.writeHead(404);
					response.write('File not found - is it supposed to exist ?');
					response.end();			
				}
				break;


			case 'served text':
				console.log('NOW in ' + state);
				if (req.url === '/question') {
					// This is an AJAX call for question(s) from the client-tester
					// This should not be immediately available until XX seconds after the text has been served to the client-reader
					// Or, give intermediate stuff until the net state is reached... think about minimizing the number of end-points
					setTimeout(function() {
						response.writeHead(200);
						response.write(JSON.stringify(currentTweet));
						response.end();
					}, 10000 - (Date.now() - delayStart));
				}
				// Need to leave the client-reader undisturbed
				// Need to keep questions off the client-tester screen
				// This is an automatically transitioning state anyway...
				else {
					response.writeHead(200);
					response.end();					
				}
				break;


			case 'wait-to-receive-answer':
				console.log('NOW in ' + state);
				if (req.url === '/') {
					// Would actually be OK for either client to receive this again
					fs.readFile('public/index.html', handleResults);
				}
				else if (req.url === '/reader.html') {
					// CLient-reader has not yet received the text; present the READ button again
					fs.readFile('public/reader.html', handleResults);
				}
				else if (req.url === '/tester.html') {
					// Client-tester should re-populate with the currentParticipant
					fs.readFile('public/tester.html', handleResults);
				}
				else if (req.url === '/participant') {
					// Serve back the current participant
					response.writeHead(200);
					response.write(JSON.stringify(currentParticipant));
					response.end();
				}
				else if (req.url === '/text') {
					response.writeHead(403);
					response.write('Request is out of order');
					response.end();		
				}
				else if (req.url === '/question') {
					response.writeHead(200);
					response.write(JSON.stringify(currentTweet));
					response.end();
				}
				else if (req.url === '/answer') {
					response.writeHead(200);
					response.write('Did NOT process answer');
					response.end();		

					// TODO: process the answer
					state = 'wait-to-serve-text';
				}
				break;

			// For undetermined STATE
			default:
				console.log('NOW in ' + state);
				if (req.url === '/') {
					response.writeHead(200);
					response.write(state + ': state is unhandled');
					response.end();	
				}
				else {
					response.writeHead(200);
					response.write('go away');
					response.end();		
				}
				break;

		}
	}
});

server.listen(port);

console.log('server is listening on port', port);
