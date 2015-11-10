var participant, currentTweet, currentResponse, questionSet, currentQuestion, answerTimer;

$(document).ready(function() {
	resetState();
});


var resetState = function() {
	$.ajax('/status').success(function(err, data, body) {
		var obj = JSON.parse(body.responseText);
		console.log('STATE is ' + obj.state);
		switch (obj.state) {
			case 'ready':
				// Server state: ready to enroll a new participant,
				//				 may have just completed an experiment.
				$('#participant-form').css('display', 'block');
				$('#participant-title').css('display', 'none');
				$('#thank-you').css('display', 'none');
				break;
			case 'wait-to-start':
				// Server state: participant has already been created.
				// Submit participant data
				submitParticipant();
				break;
			case 'wait-to-serve-text':
				// Server state: participant has already been created, 
				//               and the experiment has begun.
				// Obtain participant data
				submitParticipant();
				// Get page into proper state
				$('#start-button').css('display', 'none');
				$('#question-button').css('display', 'block');
				$('#question-display').css('display', 'none');
				break;
			case 'served text':
				// Server state: participant has already been created, 
				//               the experiment has begun, and the client-reader
				//				 has requested a text.
				// Obtain participant data
				submitParticipant(getQuestions);
				// getQuestions();
				// Get page into proper state
				$('#start-button').css('display', 'none');
				break;
			case 'wait-to-receive-answer':
				// Server state: participant has already been created, 
				//               the experiment has begun, the client-reader
				//				 has requested a text, and the reading period
				//				 has expired.
				// Obtain participant data
				submitParticipant(getQuestions);
				// getQuestions();
				// Get page into proper state
				$('#start-button').css('display', 'none');
				break;


		}
	});
};


/**
 * This method will put the page in the state of having just submitted a new participant's data.
 */
var submitParticipant = function(next) {
	var first = $('#firstName');
	var last = $('#lastName');
	var age = $('#age');

	var options = {
		url: '/participant',
		method: 'POST',
		data: {
			firstName: first.val(),
			lastName: last.val(),
			age: age.val
		},
		success: function(data) {
			// State transition: global variable assignment, display changes
			participant = data;
			$('#participant-title').css('display', 'block');
			$('#participant').html(participant.firstName + ' ' + participant.lastName);
			$('#participant-form').css('display', 'none');
			$('#experiment-number').html(participant.experiment);
		},
		error: function(data) {
			// NO state changes
			var obj = JSON.parse(data.responseText);
			console.log(obj.message);
			$('#error-hint').html(obj.message);
		},
		dataType: 'json'
	};

	first.val('');
	last.val('');
	age.val('');

	$.ajax(options);
	if (next) {
		next();
	}
};


var startExperiment = function() {
	console.log('Started experiment ' + participant.experiment);
	var options = {
		url: '/start',
		method: 'GET',

		success: function() {
			// State transition: global variable assignment, display changes
			$('#start-button').css('display', 'none');
			$('#question-button').css('display', 'block');
		},
		error: function(data) {
			alert(data.responseText);				
			if (data.responseText === 'Request is out of order') {
				resetState();
			}
		}
	};

	$.ajax(options);
};


var getQuestions = function() {
	var options = {
		url: '/question',
		method: 'GET',

		success: function(data) {
			currentTweet = data.tweet;
			$('#question-button').css('display', 'none');
			$('#question-display').css('display', 'block');

			currentResponse = {
				participant: participant._id,
				parentTweet: currentTweet._id,
				answers: [],
				score: 0,
				method: data.method
			};

			questionSet = [currentTweet.question1, currentTweet.question2, currentTweet.question3, currentTweet.question4, currentTweet.question5];

			displayQuestion();
		},
		error: function(data) {
			alert(data.responseText);				
			if (data.responseText === 'Request is out of order') {
				console.log('resetting state  from error?');
				resetState();
			}
			else {
				console.log('not recognizing error text');				
			}
		},
		dataType: 'json'
	};

	$.ajax(options);
};

var displayQuestion = function() {

	var checked = $('input[name="answer"]').filter(':checked');
	if (checked) {
		checked.removeAttr('checked');
	}

	// TODO: elaborate to deal with multiple questions, randomizing the order of questions and order of m/c questions

	var index = randomIndex(questionSet);
	// Pop a question from questionSet; will eventually empty it
	currentQuestion = questionSet.splice(index, 1)[0];

	var answers = currentQuestion.answers;

	$('#question').html(currentQuestion.question);

	index = randomIndex(answers);
	var text = answers.splice(index,1)[0]
	$('#answer-a').html(text);
	// $('#answer-a').val(text);

	index = randomIndex(answers);
	text = answers.splice(index,1)[0];
	$('#answer-b').html(text);
	// $('#answer-b').val(text);

	text = answers.pop();
	$('#answer-c').html(text);
	// $('#answer-c').val(text);

	$('#question-num').html('Question ' + (5 - questionSet.length) + ':')

	// TODO: create timer to record time-to-answer
	answerTimer = Date.now();

};

var recordAnswer = function() {
	// TODO: record the time required to submit an answer
	var checked = $('input[name="answer"]').filter(':checked');
	var answerText = $('#' + checked.val()).text();
	console.log('span ? ', answerText);

	var data = {
		question: currentQuestion.question,
		answer: answerText,
		correct: (answerText === currentQuestion.correct),
		time: (Date.now() - answerTimer)
	};
	currentResponse.answers.push(data);
	console.log('answers ' , currentResponse.answers);

	if (data.correct) {
		currentResponse.score++;
	}

	if (questionSet.length === 0) {
		sendAnswer();
	}
	else {
		displayQuestion();
	}
};

var sendAnswer = function() {
	var options = {
		url: '/answer',
		method: 'POST',
		data: JSON.stringify(currentResponse),
		contentType: 'application/json',

		success: function(data) {
			if (data === 'Answers saved') {
				resetState();
			}
			else if (data === 'Last question done') {
				$('#question-display').css('display', 'none');
				$('#thank-you').css('display', 'block');

				setTimeout(function() {
					resetState();
				}, 5000);
			}
			else {
				console.log('not correctly registering ' + data);
			}
		},
		error: function(data) {
			// TODO: correct the logic of these responses
			alert(data.responseText);
			if (data.responseText === 'Request is out of order') {
				resetState();
			}
		}
	};

	$.ajax(options);

	currentTweet = null;
	currentResponse = null;
	currentQuestion = null;
	questionSet = null;
};

var checkMe = function(element) {
	$(element).find('input').prop('checked',true);
};

var randomIndex = function(array) {
	var index = Math.floor(Math.random() * array.length);
	return index;
};