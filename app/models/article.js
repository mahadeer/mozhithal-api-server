var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var articleSchema = new Schema({
    "title": String,
    "labels": [String],
    "category": String,
    "cover": String,
    "short": String,
    "content": String,
    "reads": { type: Number, default:0 },
    "comments": { type: Number, default:0 },
    created: {
        type: Date,
        default: Date.now
    }
});

articleSchema.index({
    "title": "text",
    "labels": "text"
});

/* Get the search results of articles */
articleSchema.statics.bySearchTerm = function (term, cb) {
    return this.find({ $text: {$search: term}},
        "_id title labels short cover posted reads comments", cb);
};

/* Get the result by labels of articles */
articleSchema.statics.byLabel = function (label, cb) {
    return this.aggregate([
        { $match: { "labels": {$in: [label]} } },
        {
            $project: {
                _id: 0,
                uri: '$_id',
                title: '$title',
                short: '$short',
                cover: '$cover',
                category: '$category',
                labels: '$labels',
                posted: '$created',
                reads: '$reads',
                comments: '$comments'
            }
        },
        {$sort: {posted: -1}}
    ], cb);
};

/* Get Most Reads Articles */
articleSchema.statics.byMostReads = function (count, cb) {
    return this.aggregate([
        {
            $project: {
                _id: 0,
                uri: '$_id',
                title: '$title',
                count: '$reads'
            }
        },
        {$sort: {count: -1}},
        {$limit: count}
    ], cb);
};

articleSchema.statics.byMostCommented = function (count, cb) {
    return this.aggregate([
        {
            $project: {
                _id: 0,
                uri: '$_id',
                title: '$title',
                count: '$comments'
            }
        },
        {$sort: {count: -1}},
        {$limit: count}
    ], cb);
};

articleSchema.statics.getPaginatedArticles = function (pageObj, cb) {
    return this.aggregate([
        {
            $project: {
                _id: 0,
                uri: '$_id',
                title: '$title',
                short: '$short',
                cover: '$cover',
                category: '$category',
                labels: '$labels',
                posted: '$created',
                reads: '$reads',
                comments: '$comments'
            }
        },
        {$sort: {posted: -1}},
        {$skip: (pageObj.pageNo * pageObj.pageSize)},
        {$limit: pageObj.pageSize}
    ], cb);
};

/* Get Articles labels */
articleSchema.statics.getAllLabels = function (cb) {
    return this.aggregate([
        {
            $project: {
                _id: 0,
                labels: '$labels'
            }
        }
    ], cb);
};

/* Get recent Articles */
articleSchema.statics.getRecentPosts = function (count, cb) {
    return this.aggregate([
        {
            $project: {
                _id: 0,
                uri: '$_id',
                title: '$title',
                labels: '$labels',
                posted: '$created'
            }
        },
        {$sort: {posted: -1}},
        {$limit: count}
    ], cb);
};

/* Get Article by Id with next Article Title */
articleSchema.statics.getArticle = function (_id, cb) {
    return this.aggregate([
        {$match: {"_id": mongoose.Types.ObjectId(_id) }},
        {
            $project: {
                _id: 0,
                uri: '$_id',
                title: '$title',
                content: '$content',
                cover: '$cover',
                category: '$category',
                labels: '$labels',
                posted: '$created',
                reads: '$reads',
                comments: '$comments'
            }
        }
    ], cb);
};

articleSchema.statics.nextArticle = function (_id, cb) {
    var id = mongoose.Types.ObjectId(_id);
    return this.aggregate([
        {$match: {"_id": {$lt: id} }},
        {
            $project: {
                _id: 0,
                uri: '$_id',
                title: '$title'
            }
        },
        {$sort: { uri: -1 }},
        {$limit: 1}
    ], cb);
};

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;

/* Artcile Helper Methods */

function removeTags(txt) {
    var rex = /(<([^>]+)>)/ig;
    return txt.replace(rex, "");
}

function getShortContent(content) {
    var i = 0;
    var flag = true;
    while (flag) {
        i++;
        if (content.split('<p>')[i] != undefined) {
            var cont = content.split('<p>')[i].match('(.*)</p>');
            if (cont[1].match('<img') == null) {
                flag = false;
                return removeTags(cont[1]).substring(0, 200) + '....';
            }
        } else {
            return '............';
        }
    }
}