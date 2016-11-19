'use strict';

var server = require('./config/initializers/server');
var nconf = require('nconf');
var async = require('async');

// Load Environment variables from .env file
require('dotenv').load();

// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables
nconf.env();

// Initialize Modules
async.series([
    function initializeDBConnection(callback) {
        require('./config/initializers/database')(callback);
    },
    function startServer(callback) {
        server(callback);
    },
    function initialSeed(callback) {
        require('./config/initializers/seeds')(callback);
    }
], function(err) {
    if (err) {
        console.log(err);
    }
});
