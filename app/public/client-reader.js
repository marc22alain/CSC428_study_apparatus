var currentTweet;

$(document).ready(function() {
	resetState();
	// alert(screen.width + ' x ' + screen.height);
	// MacBookAir 11" is 1366 x 768
	if (screen.width === 1366) {
		var readerWindow = $('#reader-window')
		readerWindow.css('transform', 'scale(0.93)');
	}
	// iPhone 4S is 320 x 480 ... 160px/inch
	if (screen.width === 320) {
		var readerWindow = $('#reader-window')
		readerWindow.css('transform', 'scale(1.107)');
	}
});

var resetState = function() {
	$.ajax('/status').success(function(err, data, body) {
		var obj = JSON.parse(body.responseText);
		console.log('STATE is ' + obj.state);
	});
};


var getText = function() {
	var options = {
		url: '/text',
		method: 'GET',

		success: function(data) {

			$('#text-request-button').css('display', 'none');
			currentTweet = data;
			var textDiv = $('#full-text');
			textDiv.css('display', 'block');
			textDiv.html(currentTweet.tweet);

			// $('#answer-a').html(currentTweet.answers[0]);
			// $('#answer-b').html(currentTweet.answers[1]);
			// $('#answer-c').html(currentTweet.answers[2]);
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