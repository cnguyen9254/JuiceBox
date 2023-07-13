// Set the port number for the server
const PORT = 3000;

// Import required modules
const express = require('express');
const server = express();
const { client } = require('./db');
const morgan = require('morgan');

// Load environment variables
require('dotenv').config();

// Connect to the database
client.connect();

// Use Morgan for logging HTTP requests
server.use(morgan('dev'));

// Parse JSON request bodies
server.use(express.json());

// Import API routes
const apiRouter = require('./api');

// Set up API routes
server.use('/api', apiRouter);

// Route for setting the background color
server.get('/background/:color', (req, res, next) => {
res.send( <body style="background: ${req.params.color};"> <h1>Hello World</h1> </body> );
});

// Route for adding two numbers
server.get('/add/:first/to/:second', (req, res, next) => {
res.send(<h1>${req.params.first} + ${req.params.second} = ${ Number(req.params.first) + Number(req.params.second) }</h1>);
});

// Uncomment the following lines to add more routes:
// server.get('/posts/:postId', showSinglePostPage);
// server.get('posts/edit', showEditPage);

// Start the server
server.listen(PORT, () => {
console.log('The server is up on port', PORT);
});

// Middleware for logging the request body
server.use((req, res, next) => {
console.log('<Body Logger START>');
console.log(req.body);
console.log('<Body Logger END>');

next();
});