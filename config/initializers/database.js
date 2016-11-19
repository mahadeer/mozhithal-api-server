var mongoose = require("mongoose"),
    config = require("nconf");

module.exports = function(call_back) {
    mongoose.connect('mongodb://' + config.get('DB_HOST_ADDRESS') + '/' + config.get('DB_COLLECTION_NAME'));
    var db = mongoose.connection;
    db.on('error', function(err) {
        console.log('MongoDB did not start ' + err);
        call_back(null);
    });
    db.once('open', function() {
        console.log('MongoDB Started and Collection used is ' + config.get('DB_COLLECTION_NAME'));
        call_back();
    });
};
