const config = require('config');
var mongoClient = require('mongodb').MongoClient;
const Rx = require('rx');

function connectToDb() {
    const configDB = config.get("dbConfig");

    // create uri no user
    let uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
    //log.info('trying to connect to ' + uri + ' to initialise');

    // Connect to the db
    return mongoClient.connect(uri);
}

function getCount(collectionName, param) {
    // so many layers of rx!
    let response = new Rx.Subject();

    connectToDb()
        .then(db => {
            db.collection(collectionName).count(param, (err, count) => {
                response.onNext(count);
                response.onCompleted();
            });
        }, err => {
            response.onError(err);
        });

    return response;
}

function insert(collectionName, insertion) {
    let response = new Rx.Subject();

    connectToDb()
        .then(db => {
            db.collection(collectionName).insertOne(insertion)
                .then(succ => {
                    response.onNext(succ);
                    response.onCompleted();
                })
                .catch(errInsert => {
                    response.onError(errInsert);
                });
        }, err => {
            response.onError(err);
        });

    return response;
}

function createOrOpenDb() {

    connectToDb()
        .then(function (db) {
            db.createCollection('commands', function (err, collection) {
            });
            db.createCollection('checkpoints', function (err, collection) {
            });
            db.createCollection('clubs', function (err, collection) {
            });
            db.createCollection('teams', function (err, collection) {
            });
            db.createCollection('logins', function (err, collection) {
            });
        });

}
module.exports = {
    getCount: getCount,
    insert: insert,
    createOrOpenDb: createOrOpenDb
};
