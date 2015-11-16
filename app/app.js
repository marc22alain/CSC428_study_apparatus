var fs = require('fs');
var http = require('http');
var	mongoose = require('mongoose');
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

var port = 3000;

var state = 'ready', delayStart;

var currentParticipant, currentExperiment, currentTweet, currentTweetNum = 0, maxTweets = 36;
var methodChoices = ['traditional', 'RSVP', 'speed-reading'];
var methodChoicesReversed = ['speed-reading', 'RSVP', 'traditional'];
var methodAndTweet = {
	method: null,
	tweet: null
};

var practiceExperiment, practiceTweet, practiceTweetNum = 0, maxPracticeTweets = 6, practice = true;

schema.getPracticeExperiment(function(err, result) {
	if (err) {
		// ... already , communicated
	}
	else {
		practiceExperiment = result[0];
		console.log('practiceExperiment is ' + practiceExperiment);
	}
});

var server = http.createServer(function(req, response) {
	console.log(req.method + " request at " + req.url);

	// Three end-points serving pages:
	//		'/' providing simple buttons to direct to client reader or client tester
	//		'/reader.html'
	//		'/tester.html'

	// End-points providing study functions:
	//		'/status'	relates the sever's current status, allowing for client-reader to align its status in the event of upset
	//		'/participant'		will save a new participant to start an experiment
	//		'/start'		a signal from the client-tester to the server that the client-reader is ready to start the readings
	//		'/text'		a request from the client-reader for the next reqding
	//		'/question'	a request from the client-tester for the next question/quiz
	//		'/answer'		will save a participant's answers to a quiz about a reading
	//		 'practice' is more like a TOGGLE than a state; or a sub-state; we want to go through all of the motions on the client side, which requires
	//		 the regular progression through the states;

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

	var parsedUrl = req.url.split('.');
	var ext = parsedUrl[parsedUrl.length -1];
	if (ext === 'css' || ext === 'js' || ext === 'html') {
		fs.readFile('public' + req.url, handleResults);
	}
	else if (req.url === '/') {
		fs.readFile('public/index.html', handleResults);
	}
	else if (req.url === '/status') {
		console.log('NOW in ' + state);
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
				if (req.url === '/participant') {

					schema.unusedExperiments(function(err, results) {
						if (err) {
							// What to do ? Highly unlikely...
						}
						else {
							req.on('data', function(data) {
								var participant = JSON.parse(data);
								// var participant = parseResults(data);
								console.log('New participant is ' + JSON.stringify(participant));
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

							            // Declaration of 'in-process' allows sharing of the database among multiple experiment leaders
							            schema.updateStatus(participant.experiment, 'in-process', function(experiment) {
							            	currentExperiment = experiment;
							            });
							            state = 'wait-to-start';
										console.log('SWITCHED to ' + state);
							        }
								};

								schema.createParticipant(participant, process);
							});
						}
					});					
				}
				else if (req.url === '/text' || req.url === '/question' || req.url === '/practice' || req.url === '/start' || req.url === 'answer') {
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
				if (req.url === '/participant') {
					// Serve back the current participant
					response.writeHead(200);
					response.write(JSON.stringify(currentParticipant));
					response.end();
				}
				else if (req.url === '/practice') {
					// Respond to AJAX from client-tester, initiating actual start
					response.writeHead(200);
					response.write('OK START');
					response.end();	
					
					state = 'wait-to-serve-text';
					console.log('SWITCHED to ' + state);
				}
				else if (req.url === '/start') {
					// Respond to AJAX from client-tester, initiating actual start
					response.writeHead(200);
					response.write('OK START');
					response.end();	
					
					state = 'wait-to-serve-text';
					// This is the only opportunity to move out of 'practice' mode
					practice = false;
					console.log('SWITCHED to ' + state);
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
				if (req.url === '/participant') {
					// Serve back the current participant
					response.writeHead(200);
					response.write(JSON.stringify(currentParticipant));
					response.end();
				}
				else if (req.url === '/text') {
					// Use a Latin Square to counter-balance the starting conditions; use currentExperiment.number % 6 !
					// 24 experiments as of 15-11-11
					// A: traditional, B: RSVP, C: speed-reading
					// ABCABC
					// BCABCA
					// CABCAB
					// CBACBA
					// ACBACB
					// BACBAC
		            var suiteKeys = ['set1', 'set2', 'set3', 'set4', 'set5', 'set6'];
					var slot = Math.floor(currentTweetNum / suiteKeys.length);

					var transition = function() {
						state = 'served text';
						console.log('SWITCHED to ' + state);
						delayStart = Date.now();
						setTimeout(function() {
							state = 'wait-to-receive-answer';
							console.log('SWITCHED to ' + state);
						}, 6000);
					};

					if (practice) {
								console.log('HERE practiceExperiment.suite is ' + practiceExperiment.suite);

						schema.tweetById(practiceExperiment.suite[suiteKeys[practiceTweetNum % 6]][0], function(result) {
							console.log('new tweet is ', result);
							practiceTweet = result;

							methodAndTweet.method = methodChoices[practiceTweetNum % 3];							
							methodAndTweet.tweet = practiceTweet;

							response.writeHead(200);
							response.write(JSON.stringify(methodAndTweet));
							response.end();

							practiceTweetNum++;

							// Transition to 'served text', then 'wait-to-receive-answer' after short delay
							transition();
						});
					}
					else {
						schema.tweetById(currentExperiment.suite[suiteKeys[slot]][currentTweetNum % 6], function(result) {
							console.log('new tweet is ', result);
							currentTweet = result;

							// Determine the method: A: traditional, B: RSVP, C: speed-reading
							// 24 experiments as of 15-11-11, and avoiding off-by-1 error; numbering starts at 0
							if (currentExperiment.number < 12) {
								methodAndTweet.method = methodChoices[(Math.floor(currentTweetNum / 6)) % 3];							
							}
							else {
								methodAndTweet.method = methodChoicesReversed[(Math.floor(currentTweetNum / 6)) % 3];
							}
							methodAndTweet.tweet = currentTweet;

							response.writeHead(200);
							response.write(JSON.stringify(methodAndTweet));
							response.end();

							currentTweetNum++;

							// Transition to 'served text', then 'wait-to-receive-answer' after short delay
							transition();
						});						
					}
				}
				else if (req.url === '/question' || req.url === '/start' || req.url === '/practice') {
					// '/question' is an AJAX call for question(s) from the client-tester
					// It should not be available until 6 seconds after the text has been served to the client-reader
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
				if (req.url === '/question') {
					// This is an AJAX call for question(s) from the client-tester
					// This should not be immediately available until XX seconds after the text has been served to the client-reader
					// Or, give intermediate stuff until the net state is reached... think about minimizing the number of end-points
					setTimeout(function() {
						response.writeHead(200);
						response.write(JSON.stringify(methodAndTweet));
						response.end();
					}, 6000 - (Date.now() - delayStart));
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
				if (req.url === '/participant') {
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
					response.write(JSON.stringify(methodAndTweet));
					response.end();
				}
				else if (req.url === '/answer') {

					req.on('data', function(data) {
						var obj = JSON.parse(data);
						console.log(obj);

						if (practice) {
							// NOT saving the answers
							// Client gets different message for end-of-practice
							console.log('practice results are not recorded');
							response.writeHead(200);
							if (practiceTweetNum < maxPracticeTweets) {	// Avoiding off-by-1 errors
								response.write('Answers saved');
							}
							else {
								response.write('Last practice question done');
								practiceTweetNum = 0;

								currentParticipant.practiced += 1;
								schema.updateParticipant(currentParticipant, function(err, result) {
									if (err) {
										console.log('Problem updating PRACTICED: ' + err);
									}
									else {
										currentParticipant = result;
									}
								});
							}
							response.end();							
						}
						else {
							schema.createResult(obj, function(err) {
								if (err) {
						            response.writeHead(400);
						            response.write(JSON.stringify(err));
									response.end();
								}
								else {
									response.writeHead(200);
									if (currentTweetNum < maxTweets) {
										response.write('Answers saved');
									}
									else {
										response.write('Last question done');
										// Putting these tasks here, as the asynchronous call will finish later
										currentTweetNum = 0;
										currentParticipant = null;
										// TODO: move experiment to 'completed'; not strictly required
										currentExperiment = null;
									}
									response.end();
								}
							});							
						}
					});

					// Eliminate risk of confusion
					methodAndTweet.method = null;
					methodAndTweet.tweet = null;

					console.log('*#*#*#*#*#*#*#  AT TEST: ' + practiceTweetNum  + ' vs ' + maxPracticeTweets);
					if (practiceTweetNum  === maxPracticeTweets) {
						// Participant has just completed practice by submitting the sixth answer,
						// so present them with the opportunity to start the experiment or practice some more.
						state = 'wait-to-start';
					}
					else if (currentTweetNum < maxTweets) {
						state = 'wait-to-serve-text';
					}
					else {
						state = 'ready';
					}
					console.log('SWITCHED to ' + state);
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
