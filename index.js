/**
 * Primary file for the api
 * 
 */

const http = require('http');
const url = require('url');
const StringDecoder = require('String_decoder').StringDecoder;
const config = require('./config');

// Create the HTTP Server
const httpServer = http.createServer(function(req,res) {
    unifiedServer(req, res);
});

// Start the HTTP Server
httpServer.listen(config.httpPort, function() {
    console.log(`The server is running on port ${config.httpPort} in ${config.envName} mode`);
});

const unifiedServer = function(req, res) {
    // Get the url and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the method
    const method = req.method.toLowerCase();

    // Get the  headers 
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to. If handler does not exist route to not found
        const chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler 
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        // Route the request to the handler specified
        chooseHandler(data, function(statusCode, payload) {
            // Use the status code called back by the user or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler of default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload into a string
            const payloadString = JSON.stringify(payload);

            // Return the response 
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning this response :', statusCode, payloadString);
        });

    });
};

// Define the handlers
let handlers = {};

// /hello handler
handlers.hello = function(data, callback) {
    callback(200, {'message' : 'Welcome to my simple Hello World API' });
};

// Not Found handler
handlers.notFound = function(data, callback) {
    callback(404, {'error' : 'This Page does not exist'});
};

// Define request router
const router = {
    'hello' : handlers.hello
};