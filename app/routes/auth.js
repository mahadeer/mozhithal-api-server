var async = require("async"),
    config = require("nconf"),
    jwt = require("jsonwebtoken");

module.exports = function(router) {
    'use strict';
    router.post('/login', function(req,res){
        var username = req.body.username;
        var password = req.body.password;
        if(username === config.get("ADMIN_USERNAME")
            && password === config.get("ADMIN_PASSWORD")) {
            var tokenObj = {};
            tokenObj.createdOn = Date.now();
            tokenObj.refAddress = GetClientIP(req);
            var token = jwt.sign(tokenObj, config.get("ADMIN_SECRET"));
            res.json({
                token: token,
                status: true,
                url: config.get("ADMIN_URL")
            });
        } else {
            res.json({
                status: false,
                    msg: 'Authentication failed'
            });
        }
    });
};

function GetClientIP(request) {
    var ip;
    if (request.headers['x-forwarded-for']) {
        ip = request.headers['x-forwarded-for'].split(",")[0];
    } else if (request.connection && request.connection.remoteAddress) {
        ip = request.connection.remoteAddress;
    } else {
        ip = request.ip;
    }
    return ip;
}