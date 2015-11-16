var currentTweet;
var spritzController = null;


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

	// Construct a SpritzController passing the customization options
	spritzController = new SPRITZ.spritzinc.SpritzerController(customOptions);

	// Attach the controller's container to this page's "spritzer" container
	var spritzer = $("#spritzer");
	spritzController.attach(spritzer);

	// Make the SpritzController disappear when the reading is over
	spritzer.on('onSpritzComplete', function() {
		console.log('Done serving the text');
		setTimeout(function() {
			$('#spritzdiv').css('display', 'none');
			$('#text-request-button').css('display', 'block');			
		}, 2000);
	});

});

var resetState = function() {
	// Holding this in the event it's required to restore state
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

			// var spritzing = false;
			// var RSVP = false;

			var tweetWords = [];
			tweetWords = tweetWords.concat(currentTweet.tweet.author.split(' '));
			tweetWords = tweetWords.concat(currentTweet.tweet.date.split(' '));
			tweetWords = tweetWords.concat(currentTweet.tweet.tweet.split(' '));

			// Calculating the magic constant: seconds (per minute) per word (per minute), in milliseconds
			var wordTime = (60/300) * 1000;

			if (currentTweet.method === 'speed-reading') {
				console.log('attempting to send translate the Tweet');
				$('#spritzdiv').css('display', 'block');
				// Send to SpritzEngine to translate
				var totalText = currentTweet.tweet.author + ' ' + currentTweet.tweet.date + ' ' + currentTweet.tweet.tweet;
				SpritzClient.spritzify(totalText, "en_us;", onSpritzifySuccess, onSpritzifyError);
			}
			else if (currentTweet.method === 'RSVP') {
				var textDiv = $('#rsvp');
				textDiv.css('display', 'block');
				textDiv.html(tweetWords.shift());

				var rsvper = setInterval(function(){
					// Check for words at the start of the interval; this allows the last word to be displayed for its full interval
					if (tweetWords.length === 0) {
						clearInterval(rsvper);
						textDiv.css('display', 'none');
						$('#text-request-button').css('display', 'block');			
					}
					textDiv.html(tweetWords.shift());
				}, wordTime);
			}
			else {
				console.log('Full-text display now: ' + currentTweet.tweet.tweet);

				// Counting how many words in a tweet, plus one each for author and date
				// Time to read in milliseconds, from 60 seconds / 300 words per second
				var timeToRead = tweetWords.length * wordTime;
				console.log('time give is ' + timeToRead);

				var textDiv = $('#full-text');
				textDiv.css('display', 'block');
				textDiv.html('&nbsp' + currentTweet.tweet.author + '<br>' + '&nbsp' + currentTweet.tweet.date + '&nbsp<br>' + currentTweet.tweet.tweet);

				setTimeout(function() {
					textDiv.css('display', 'none');
					$('#text-request-button').css('display', 'block');			
				}, timeToRead);
			}
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

/******************************** SPRITZ *******************************/


	var onSpritzifySuccess = function(spritzText) {
		console.log('attempting to display the Tweet');
		spritzController.startSpritzing(spritzText);
	};
	
	var onSpritzifyError = function(error) {
		alert("Unable to Spritz: " + error.message);
	};
	
	// Customized options
	var customOptions = {
            placeholderText:    { startText: '' },
			redicleWidth: 	    126,	// Specify Redicle width
			redicleHeight: 	    36,		// Specify Redicle height
		    header: {
		        login: false,        // Show login link
		        close: false,       // Close "x" button
		        closeHandler: null  // Optional callback to set, otherwise uses default
		    },
			speedItems: [],
			controlButtons: [],
			defaultSpeed: 300
	};	