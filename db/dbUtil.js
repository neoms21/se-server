const config = require('config');
var mongoClient = require('mongodb').MongoClient;
var q = require('q');

function getDb(log) {
    var deferred = q.defer();
    var configDB = config.get("dbConfig");

    // create uri no user
    var uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
    log.info('trying to connect to ' + uri + ' to initialise');

    // Connect to the db
    mongoClient.connect(uri, function (err, db) {

        if (!err) {
            log.info("We are connected to mongo");
            deferred.resolve(db);
        } else {
            log.error(err);
            deferred.reject(err);
        }
    });

    return deferred.promise;
}

module.exports = getDb;
