var mongoose = require("mongoose"),
    async = require('async'),
    Chance = require('chance'),
    Article = require('./../../app/models/article'),
    Search = require('./../../app/models/misc');

var mockSeeds = require('./db-seeds/articles.json');
module.exports = function(call_back) {
    async.series([Fn_ArticleSeed, Fn_SearchSeed], function(err) {
        if (err) {
            console.log(err);
        }
        call_back();
    });
};


/* Seed Functions */

var Fn_ArticleSeed = function (call_back) {
    Article.count({}, function(err, count){
        if(count == 0) {
            console.log('Initial Articles seeds running...');
            var NewArticles = [];
            mockSeeds.reverse().forEach(function(seed){
                var  article = new Article();
                article.title = seed.title;
                article.category = "உடலரசியல்";
                seed.labels.split(",").forEach(function(label){
                    article.labels.push(label.trim());
                });
                article.cover = seed.cover;
                article.content = seed.content;
                article.short = seed.short;
                var chance = new Chance();
                for(var i = 0; i< seed.likes; i++) {
                    article.likes.push(chance.name());
                }
                var _comments = [];
                for(var j = 0; j< seed.comments; j++) {
                    var _comment = {};
                    _comment.comment = chance.sentence();
                    _comments.push(_comment);
                }
                article.comments = _comments;
                NewArticles.push(article);
                console.log('Articles seeds pushed ' + article.title);
            });
            async.eachSeries(NewArticles, function(article, asyncdone){
                article.save(asyncdone);
            }, function(err) {
                if(err)
                    console.log(err);
                console.log('Initial Articles seeds finished...');
                call_back();
            });
        }
    });
};

var Fn_SearchSeed = function (call_back) {
    Search.count({}, function(err, count){
        if(count == 0) {
            console.log('Initial Search seeds running...');
            var SearchTerms = [];
            var term1 = new Search();
            term1.count = 23;
            term1.keyword = "மார்க்ஸ்";
            var term2 = new Search();
            term2.count = 17;
            term2.keyword = "தமிழ் சினிமா";
            var term3 = new Search();
            term3.count = 7;
            term3.keyword = "பாலியல் அரசியல் ";
            async.eachSeries([term1,term2,term3], function(term, asyncdone){
                term.save(asyncdone);
            }, function(err) {
                if(err)
                    console.log(err);
                console.log('Initial Search seeds finished...');
                call_back();
            });
        }
    });
};