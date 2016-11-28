const config = require('config');
var mongoClient = require('mongodb').MongoClient;
const Rx = require('rx');

function connectToDb() {
    const configDB = config.get("dbConfig");

    // create uri no user
    let uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
    //log.info('trying to connect to ' + uri + ' to initialise');

    // Connect to the db
    return Rx.observable.fromNodeCallback(mongoClient.connect(uri));

    // , function (err, db) {
    //
    //     if (!err) {
    //         log.info("We are connected to mongo");
    //         deferred.resolve(db);
    //     } else {
    //         log.error(err);
    //         deferred.reject(err);
    //     }
    // });
    //
    // return deferred.promise;
}

module.exports = {
    connectToDb: connectToDb
};
