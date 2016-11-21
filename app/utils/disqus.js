var request = require("request"),
    async = require("async"),
    config = require("nconf"),
    mongoose = require('mongoose'),
    Article = require('./../models/article');

module.exports = function (callback) {
    request({
        url: config.get('DISQUS_URL'),
        method: 'GET',
        qs: {
            'api_key': config.get('DISQUS_SECRET_KEY'),
            'forum': config.get('DISQUS_FORUMN_NAME')
        },
        json: true
    }, function (err, response, body) {
        var threads = body.response;
        var threadComments = [];
        threads.forEach(function (thread) {
            threadComments.push({
                '_id': thread.identifiers[0].split('_')[1],
                'comments': thread.posts
            });
        });
        async.eachSeries(threadComments, function (thread, asyncdone) {
            Article.findOne({'_id': mongoose.Types.ObjectId(thread._id)}, function (err, article) {
                if(article) {
                    article.comments = thread.comments;
                    article.save(asyncdone);
                } else {
                    asyncdone();
                }
            });
        }, function (err) {
            if (err)
                console.log(err);
            if (callback)
                callback();
        });
    });
};