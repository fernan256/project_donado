/*
 * API
*/

// Dependencies
var http = require('http');
var url = require('url');

// The server should respond to all request with a string
var server = http.createServer(function(req, res) {
	
	// Get the URL and parse it
	var parseURL = url.parse(req.url,trur);

	// Ger the path
	var path = parseURL.pathName;


	// Send the response
	res.end('Hello diego\n');

	// Log the request path


});

// Start the server and have it listen on port 3000
server.listen(3000, function() {
	console.log("The server is listen on port 30000");
});