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

    // Choose the handler this request should go to. If one is no found then go to the not found

    var chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };

    // Route the request to the handler specified in the router
    chooseHandler(data,function(statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statudCode: 200;

      // Use the payload called back by the handler, or default empty object
      payload = typeof(payload) == 'object' ? payload: {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.writeHead(statusCode);

      // Send the response
      res.end(payloadString);

      // Log the request path
      console.log('This response: ', statusCode, payloadString);

    });
	});
});

// Start the server and have it listen on port 3000
server.listen(3000, function() {
	console.log("The server is listen on port 3000");
});

// Define the headers
var handlers = {};

// Sample handler
handlers.sample =  function(data,callback) {

  // Callback a http status code, and a payload object
  callback(406,{'name' : 'sample handler'});

};

// Not found handler
handlers.notFound = function(data,callback) {
  callback(404);
};

// Define a request router
var router = {
  'sample': handlers.sample
};
