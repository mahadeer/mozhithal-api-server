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

var feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    isRead: Boolean,
    posted: {
        type: Date,
        default: Date.now
    }
});

var Feedback = mongoose.model('Feedback', feedbackSchema);

var subscriberSchema = new mongoose.Schema({
    email: String,
    added: {
        type: Date,
        default: Date.now
    },
    activated: Boolean
});

var Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = {
    Search: Search,
    Feedback: Feedback,
    Subscriber: Subscriber
};

