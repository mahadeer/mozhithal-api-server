var article = {
    "_id": "",
    "title": "",
    "labels": [],
    "category": "",
    "cover": "",
    "short": "",
    "content": "",
    "likes": [],
    "comments": [
        {
            "_userId": "",
            "comment": "",
            "createdOn": "",
            "likes": []
        }
    ]
};

Article.find().byTopReads(2).exec(function (err, docs) {
    docs.forEach(function (doc) {
        console.log(doc);
    });
});

Article.getArticle('5814babef8fb92a844769449', function (err, doc) {
    console.log(doc);
});

/* Get Top Reads */
articleSchema.query.byTopReads = function (count) {
    return this.model.aggregate([
        { $project: { _id: 0, mugavari: '$_id', thalaipu: '$title', ennikai: { $size: '$likes' } } },
        { $sort: { ennikai: -1 } },
        { $limit: count }
    ]);
};

/* Get Article and update read count */
articleSchema.statics.getArticle = function (_id, cb) {
    this.findOne({ _id: _id }, function (err, article) {
        article.read = article.read + 1;
        article.save(function (sErr) {
            cb(err, article);
        });
    });
};

/* 
    coll.find({ '_id': {'$lt': my_id}}).sort([('_id', -1)]).limit(3)  # before
    coll.find({ '_id': {'$gt': my_id}}).sort('_id').limit(3)  # after
*/
