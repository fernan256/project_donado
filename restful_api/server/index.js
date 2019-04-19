/*
 * API
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

let config = require('../config');
let fs = require('fs');

// Instantiate the HTTP server
let httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});
// Start HTTP server
httpServer.listen(config.httpPort, () => {
  console.log("The server is listen on port " + config.httpPort + " in " + config.envName + " mode");
});

// Instantiate the HTTPS server
let httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};
let httpsServer = https.createServer(httpsServerOptions,(req, res) => {
  unifiedServer(req, res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log("The server is listen on port " + config.httpsPort + " in " + config.envName + " mode");
});



// Logic for http and https servers
let unifiedServer = (req, res) => {

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
  req.on('data',(data) => {
    buffer += decoder.write(data);
  });
  req.on('end',() => {
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
    chooseHandler(data,(statusCode, payload) => {
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

}

// Define the headers
let handlers = {};

// Sample handler
handlers.sample = (data,callback) => {

  // Callback a http status code, and a payload object
  callback(406,{'name' : 'sample handler'});

};

// Not found handler
handlers.notFound = (data,callback) => {
  callback(404);
};

// Define a request router
let router = {
  'sample': handlers.sample
};
