var async = require("async"),
    mongoose = require('mongoose'),
    Article = require('./../models/article'),
    Search = require('./../models/misc');
module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /users/:user_id
    router.route('/:_id')
        .get(function (req, res, next) {
            var responseObject = {};
            async.series([
                function (callback) {
                    Fn_GetArticleById(req.params._id, responseObject ,callback);
                },
                function (callback) {
                    Fn_GetNextArticleInfo(req.params._id, responseObject ,callback);
                },
                function (callback) {
                    Fn_UpdateArticleReads(req.params._id, callback);
                }
            ], function(err){
                if (err) {
                    console.log(err);
                }
                res.json(responseObject);
            });
        })
        .put(function (req, res, next) {
            // Update user
        })
        .patch(function (req, res, next) {
            // Patch
        })
        .delete(function (req, res, next) {
            // Delete record
        });

    router.get('/api/info', function (req, res) {
        var responseObject = {};
        async.series([
            function (callback) {
                Fn_GetArticleLabels(responseObject, callback);
            },
            function(callback) {
                Fn_GetRecentArticles(responseObject, callback);
            }
        ], function (err) {
            if (err) {
                console.log(err);
            }
            res.json(responseObject);
        });
    });

    router.route('/?')
        .get(function (req, res, next) {
            var pgNo = (req.query.pgNo != undefined) ? Number(req.query.pgNo) : 0;
            Article.getPaginatedArticles({pageNo: pgNo, pageSize: 3}, function (err, articles) {
                res.json(articles);
            });
        });
};

/* Article Helper functions */

var Fn_GetArticleLabels = function (obj, callback) {
    Article.getAllLabels(function (err, collection) {
        var labelsInfo = {};
        collection.forEach(function (result) {
            result.labels.forEach(function (label) {
                label = label.trim();
                if (labelsInfo[label] == undefined) {
                    labelsInfo[label] = 1;
                } else {
                    labelsInfo[label] = labelsInfo[label] + 1;
                }
            });
        });
        /* Convert labels info object to array */
        obj.labels = [];
        for (var key in labelsInfo) {
            obj.labels.push({
                label: key,
                count: labelsInfo[key]
            });
        }
        callback();
    });
};

var Fn_GetRecentArticles = function (obj, callback) {
    Article.getRecentPosts(5, function (err, articles) {
        obj.recentPosts = articles;
        callback();
    });
};

var Fn_GetArticleById = function(_id, obj, callback) {
    Article.getArticle(_id, function(err,article){
       obj.article = article[0];
        callback();
    });
};

var Fn_GetNextArticleInfo = function(_id, obj, callback) {
    Article.nextArticle(_id, function(err,nextArticle){
        obj.next = nextArticle[0];
        obj.isNext = (nextArticle.length > 0);
        callback();
    });
};

var Fn_UpdateArticleReads = function (_id, callback) {
    Article.findOne({'_id': mongoose.Types.ObjectId(_id)}, function (err, article) {
        article.reads = article.reads + 1;
        article.save(function (err) {
            if (!err) {
                callback();
            } else {
                callback(null);
            }
        });
    });
};