var participant, currentTweet;

$(document).ready(function() {
	resetState();
});


var resetState = function() {
	$.ajax('/status').success(function(err, data, body) {
		var obj = JSON.parse(body.responseText);
		console.log('STATE is ' + obj.state);
		switch (obj.state) {
			case 'ready':
				// do nothing more
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
				break;
			case 'served text':
				// Server state: participant has already been created, 
				//               the experiment has begun, and the client-reader
				//				 has requested a text.
				// Obtain participant data
				submitParticipant();
				getQuestions();
				// Get page into proper state
				$('#start-button').css('display', 'none');
				break;
			case 'wait-to-receive-answer':
				// Server state: participant has already been created, 
				//               the experiment has begun, the client-reader
				//				 has requested a text, and the reading period
				//				 has expired.
				// Obtain participant data
				submitParticipant();
				getQuestions();
				// Get page into proper state
				$('#start-button').css('display', 'none');
				break;


		}
	});
}


/**
 * This method will put the page in the state of having just submitted a new participant's data.
 */
var submitParticipant = function() {
	// TODO: write function
	var first = document.getElementById('firstName').value;
	var last = document.getElementById('lastName').value;
	var age = document.getElementById('age').value;

	var options = {
		url: '/participant',
		method: 'POST',
		data: {
			firstName: first,
			lastName: last,
			age: age
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

	$.ajax(options);
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
}


var getQuestions = function() {
	var options = {
		url: '/question',
		method: 'GET',

		success: function(data) {
			currentTweet = data;
			$('#question-button').css('display', 'none');
			$('#question-display').css('display', 'block');
			$('#question').html(currentTweet.question);

			$('#answer-a').html(currentTweet.answers[0]);
			$('#answer-b').html(currentTweet.answers[1]);
			$('#answer-c').html(currentTweet.answers[2]);
		},
		error: function(data) {
			alert(data.responseText);				
			if (data.responseText === 'Request is out of order') {
				resetState();
			}
		},
		dataType: 'json'
	};

	$.ajax(options);
}


var recordAnswer = function() {
	var checked = $('input[name="answer"]').filter(':checked');
	console.log(checked.val());

	// MUST DO to avoid any later confusion
	currentTweet = null;
}

var checkMe = function(element) {
	$(element).find('input').prop('checked',true);
}