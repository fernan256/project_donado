/*
 * API
*/

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

let config = require('../config');

// The server should respond to all request with a string
let server = http.createServer(function(req, res) {

	// Get the URL and parse it
	let parsedURL = url.parse(req.url,true);

	// Ger the path
	let path = parsedURL.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as a object
	let queryStringObject = parsedURL.query;

	// Get the http method
	let method = req.method.toLowerCase();

	// Get the headers as an object
	let headers = req.headers;

	// Get the payload, if any
	let decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data',function(data) {
		buffer += decoder.write(data);
	});
	req.on('end',function() {
		buffer += decoder.end();

    // Choose the handler this request should go to. If one is no found then go to the not found

    let chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    let data = {
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
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);

      // Send the response
      res.end(payloadString);

      // Log the request path
      console.log('This response: ', statusCode, payloadString);

    });
	});
});

// Start the server
server.listen(config.port, function() {
	console.log("The server is listen on port " + config.port + " in " + config.envName + " mode");
});

// Define the headers
let handlers = {};

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
let router = {
  'sample': handlers.sample
};
