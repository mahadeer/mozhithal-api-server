var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var searchSchema =  new Schema({
    "keyword": String,
    "count": Number
});

/* Get Most searched terms */
searchSchema.statics.byMostSearched = function (count, cb) {
    return this.aggregate([
        { $project: {
            _id: 0,
            keyword: '$keyword',
            count: '$count'
        } },
        { $sort: { count: -1 } },
        { $limit: count }
    ], cb);
};

var Search = mongoose.model('search', searchSchema);

module.exports = Search;

