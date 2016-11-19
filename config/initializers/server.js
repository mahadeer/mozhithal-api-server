var express = require('express');
var path = require('path');
// Local dependecies
var config = require('nconf');

// create the express app
// configure middlewares
var bodyParser = require('body-parser');
var cors = require('cors');
var app;

var server = function(cb) {
    'use strict';
    // Configure express 
    app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json({
        type: '*/*'
    }));

    app.use(cors());
    require('../../app/routes/index')(app);

    // Error handler
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: (app.get('env') === 'development' ? err : {})
        });
        next(err);
    });

    app.listen(config.get('NODE_PORT'));
    console.log(config.get('APP_NAME') + ' server started at ' + config.get('NODE_PORT'))
    if (cb) {
        cb();
    }
};

module.exports = server;
