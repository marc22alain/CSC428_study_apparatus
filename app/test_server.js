'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	request = require('request'),
	cheerio = require('cheerio');

/**
 * Globals
 */
// var user, candidate;
var URL = 'http://localhost:3000';

var standardOptions = {
	url: URL + '/participant',
	method: 'POST',
	form: {
		firstName: 'PeeWee',
		lastName: 'Herman',
		age: '56'
	}
};

var currentTweet;

/**
 * Unit tests
 */
describe('Server in state: READY', function() {
	it('should confirm state', function(done) {
		var link = URL + '/status';
		request(link, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var obj = JSON.parse(body);

			(obj.state).should.equal('ready');
			done();
		});
	});


	it('should serve up index.html', function(done) {
		var link = URL + '/';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});

	it('should serve up reader.html', function(done) {
		var link = URL + '/reader.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Reader Page');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});

	it('should serve up tester.html', function(done) {
		var link = URL + '/tester.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Participant Creation');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});

	it('should fail to create participant with missing first name', function(done) {
		var options = {
			url: URL + '/participant',
			method: 'POST',
			form: {
				lastName: 'Borman',
				age: '56'
			}
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(400);
			var obj = JSON.parse(body);

			(obj.message).should.equal('Please provide a first name.');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});

	it('should fail to create participant with missing last name', function(done) {
		var options = {
			url: URL + '/participant',
			method: 'POST',
			form: {
				fistName: 'Borman',
				age: '56'
			}
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(400);
			var obj = JSON.parse(body);

			(obj.message).should.equal('Please provide a last name.');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});

	it('should fail to create participant with missing age', function(done) {
		var options = {
			url: URL + '/participant',
			method: 'POST',
			form: {
				firstName: 'Fred',
				lastName: 'Borman'
			}
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(400);
			var obj = JSON.parse(body);

			(obj.message).should.equal('Please provide an age.');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});


	it('should ignore /text', function(done) {
		var options = {
			url: URL + '/text',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(403);
			(body).should.equal('Request is out of order');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});

	it('should ignore /question', function(done) {
		var options = {
			url: URL + '/question',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(403);
			(body).should.equal('Request is out of order');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('ready');
				done();
			});
		});
	});

	// Saving the state transition until the end of this test suite.
	it('should create participant', function(done) {

		request(standardOptions, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var obj = JSON.parse(body);

			(obj.firstName).should.equal(standardOptions.form.firstName);

			// Confirming CHANGED STATE
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-start');
				done();
			});
		});
	});
});


describe('Server in state: WAIT-TO-START', function() {
	it('should confirm state', function(done) {
		var link = URL + '/status';
		request(link, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var obj = JSON.parse(body);

			(obj.state).should.equal('wait-to-start');
			done();
		});
	});

	it('should serve up index.html', function(done) {
		var link = URL + '/';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);

			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-start');
				done();
			});
		});
	});

	it('should serve up reader.html', function(done) {
		var link = URL + '/reader.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Reader Page');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-start');
				done();
			});
		});
	});

	it('should serve up tester.html', function(done) {
		var link = URL + '/tester.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Participant Creation');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-start');
				done();
			});
		});
	});

	it('should NOT create new participant', function(done) {
		var options = {
			url: URL + '/participant',
			method: 'POST',
			form: {
				firstName: 'Don',
				lastName: 'Ho',
				age: '48'
			}
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			// console.log('response is ' + JSON.stringify(response));
			var obj = JSON.parse(body);
			// console.log('body is ' + obj.firstName);

			(obj.firstName).should.equal(standardOptions.form.firstName);

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-start');
				done();
			});
		});
	});


	it('should ignore /text', function(done) {
		var options = {
			url: URL + '/text',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(403);
			(body).should.equal('Request is out of order');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-start');
				done();
			});
		});
	});

	it('should ignore /question', function(done) {
		var options = {
			url: URL + '/question',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(403);
			(body).should.equal('Request is out of order');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-start');
				done();
			});
		});
	});

	// Saving the state transition until the end of this test suite.
	it('should change on START', function(done) {
		var options = {
			url: URL + '/start',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			// console.log('response is ' + body);

			(body).should.equal('OK START');

			// Confirming CHANGED STATE
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});
});


describe('Server in state: WAIT-TO-SERVE-TEXT', function() {
	it('should confirm state', function(done) {
		var link = URL + '/status';
		request(link, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var obj = JSON.parse(body);

			(obj.state).should.equal('wait-to-serve-text');
			done();
		});
	});

	it('should serve up index.html', function(done) {
		var link = URL + '/';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);

			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});

	it('should serve up reader.html', function(done) {
		var link = URL + '/reader.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Reader Page');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});

	it('should serve up tester.html', function(done) {
		var link = URL + '/tester.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Participant Creation');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});

	it('should NOT create new participant', function(done) {
		var options = {
			url: URL + '/participant',
			method: 'POST',
			form: {
				firstName: 'Don',
				lastName: 'Ho',
				age: '48'
			}
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			// console.log('response is ' + JSON.stringify(response));
			var obj = JSON.parse(body);
			// console.log('body is ' + obj.firstName);

			(obj.firstName).should.equal(standardOptions.form.firstName);

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});

	it('should ignore /question', function(done) {
		var options = {
			url: URL + '/question',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(403);
			(body).should.equal('Request is out of order');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});

	it('should ignore /start', function(done) {
		var options = {
			url: URL + '/start',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(403);
			(body).should.equal('Request is out of order');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});

	it('should serve a tweet with /text', function(done) {
		var options = {
			url: URL + '/text',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var obj = JSON.parse(body);
			currentTweet = obj;
			should.exist(obj.tweet);

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('served text');
				done();
			});
		});
	});
});


describe('Server in state: SERVED TEXT', function() {
	it('should confirm state', function(done) {
		var link = URL + '/status';
		request(link, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var obj = JSON.parse(body);

			(obj.state).should.equal('served text');
			done();
		});
	});
});


describe('Server in state: WAIT-TO-RECEIVE-ANSWER ... after delay', function() {
	it('should confirm state', function(done) {
		// To override Mocha's default timeout criterion
		this.timeout(0);
		var link = URL + '/status';
		setTimeout(function(){
			request(link, function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);

				(obj.state).should.equal('wait-to-receive-answer');
				done();
			});
		}, 11000);
	});

	it('should serve up index.html', function(done) {
		var link = URL + '/';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);

			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-receive-answer');
				done();
			});
		});
	});

	it('should serve up reader.html', function(done) {
		var link = URL + '/reader.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Reader Page');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-receive-answer');
				done();
			});
		});
	});

	it('should serve up tester.html', function(done) {
		var link = URL + '/tester.html';
		request(link, function(err, response, html) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var page = cheerio.load(html);
			(page("title").text()).should.equal('Text Presentation Study - Participant Creation');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-receive-answer');
				done();
			});
		});
	});

	it('should NOT create new participant', function(done) {
		var options = {
			url: URL + '/participant',
			method: 'POST',
			form: {
				firstName: 'Don',
				lastName: 'Ho',
				age: '48'
			}
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			// console.log('response is ' + JSON.stringify(response));
			var obj = JSON.parse(body);
			// console.log('body is ' + obj.firstName);

			(obj.firstName).should.equal(standardOptions.form.firstName);

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-receive-answer');
				done();
			});
		});
	});

	it('should ignore /text', function(done) {
		var options = {
			url: URL + '/text',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(403);
			(body).should.equal('Request is out of order');

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-receive-answer');
				done();
			});
		});
	});

	it('should send tweet in response to /question', function(done) {
		var options = {
			url: URL + '/question',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			var obj = JSON.parse(body);
			(obj.tweet).should.equal(currentTweet.tweet);

			// Confirming that STATE is UNCHANGED
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-receive-answer');
				done();
			});
		});
	});

	it('should acknowledge response to /answer', function(done) {
		var options = {
			url: URL + '/answer',
			method: 'GET',
		}
		request(options, function(err, response, body) {
			should.not.exist(err);
			(response.statusCode).should.equal(200);
			(body).should.equal('saved answer');

			// Confirming CHANGED STATE
			request(URL + '/status', function(err, response, body) {
				should.not.exist(err);
				(response.statusCode).should.equal(200);
				var obj = JSON.parse(body);
				(obj.state).should.equal('wait-to-serve-text');
				done();
			});
		});
	});
});
