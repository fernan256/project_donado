/*
 * API
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all request with a string
var server = http.createServer(function(req, res) {

	// Get the URL and parse it
	var parsedURL = url.parse(req.url,true);

	// Ger the path
	var path = parsedURL.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as a object
	var queryStringObject = parsedURL.query;

	// Get the http method
	var method = req.method.toLowerCase();

	// Get the headers as an object
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',function(data) {
		buffer += decoder.write(data);
	});
	req.on('end',function() {
		buffer += decoder.end();

		// Send the response
		res.end('Hello diego\n');

		// Log the request path
		console.log('Request received on path: '+trimmedPath+ ' with this method: '+method+ ' and this query: ',queryStringObject);
		console.log('Headers: ', headers);
		console.log('This payload: ', buffer);
	});
});

// Start the server and have it listen on port 3000
server.listen(3000, function() {
	console.log("The server is listen on port 30000");
});
