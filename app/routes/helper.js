var async = require("async"),
    Article = require('./../models/article'),
    Search = require('./../models/misc');
var responseObject = {};
module.exports = function (router) {
    'use strict';

    router.route('/')
        .get(function (req, res, next) {
            responseObject = {};
            async.series([Fn_GetMostSearched, Fn_GetMostCommented, Fn_GetMostLiked], function (err) {
                if (err) {
                    console.log(err);
                }
                res.json(responseObject);
            });
        });
    router.get('/search/:term', function (req, res, next) {
        var collection = [];
        async.series([
            function (callback) {
                Fn_UpdateSearchTerm(req.params.term, callback);
            },
            function (callback) {
                Fn_GetSearchResults(req.params.term, collection, callback);
            }
        ], function (err) {
            if (err) {
                console.log(err);
            }
            res.json(collection);
        });
    });
    router.get('/labels/:label', function (req, res, next) {
        Article.byLabel(req.params.label, function (err, results) {
            res.json(results);
        });
    });
};


/* Helper functions */
var Fn_GetMostSearched = function (callback) {
    Search.byMostSearched(5, function (err, searches) {
        responseObject.searches = searches;
        callback();
    });
};
var Fn_GetMostLiked = function (callback) {
    Article.byMostReads(5, function (err, reads) {
        responseObject.reads = reads;
        callback();
    });
};
var Fn_GetMostCommented = function (callback) {
    Article.byMostCommented(5, function (err, comments) {
        responseObject.comments = comments;
        callback();
    });
};

var Fn_UpdateSearchTerm = function (term, callback) {
    Search.findOne({'keyword': term}, function (err, search) {
        if (!search) {
            search = new Search();
            search.keyword = term;
            search.count = 0;
        }
        search.count = search.count + 1;
        search.save(function (err) {
            if (!err) {
                callback();
            } else {
                callback(null);
            }
        });
    });
};

var Fn_GetSearchResults = function (term, collection, callback) {
    Article.bySearchTerm(term, function (err, results) {
        results.forEach(function (result) {
            collection.push({
                uri: result._id,
                title: result.title,
                labels: result.labels,
                short: result.short,
                cover: result.cover,
                posted: result.posted,
                reads: result.reads,
                comments: result.comments
            });
        });
        callback();
    });
};