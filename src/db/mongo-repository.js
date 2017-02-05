'use strict';
var config = require('config');
var mongoClient = require('mongodb');
var Rx = require('rxjs/Rx');
var util = require('util');

var logger;
var connection;

function init(log) {
    logger = log;
}

function connectToDb() {

    if (connection === undefined) {
        var configDB = config.get("dbConfig");

        // create uri no user
        var uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
        logger.info('Trying to connect to ' + uri + ' for db');

        // Connect to the db
        connection = mongoClient.connect(uri);
    }

    return connection;
}

function getCount(collectionName, param) {
    var response = new Rx.Subject();

    this.connectToDb()
        .then(function (db) {
            db.collection(collectionName).count(param)
                .then(function (count) {
                    response.next(count);
                    response.complete();
                })
                .catch(function (err) {
                    response.error(err);
                });
        });

    return response;
}

function insert(collectionName, insertion) {
    var response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
                db.collection(collectionName).insertOne(insertion)
                    .then(function (succ) {
                            response.next(succ);
                            response.complete();
                        }
                    )
                    .catch(function (errInsert) {
                            response.error(errInsert);
                        }
                    );
            }, function (err) {
                response.error(err);
            }
        );

    return response;
}

var createCollection = function (db, name) {
    db.createCollection(name, function (err, collection) {
        if (util.isNullOrUndefined(err)) {
            logger.info('[Db] - created ' + name + ' collection');
        } else {
            logger.error('[Db] - trying to create ' + name + ' collection, error ' + err.toString());
        }
    });
};

function createOrOpenDb() {
    var response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
            createCollection(db, 'commands');
            createCollection(db, 'events');
            createCollection(db, 'clubs');
            createCollection(db, 'teams');
            createCollection(db, 'logins');
        })
        .catch(function (err) {
                response.error(err.toString());
            }
        );

    return response;
}

module.exports = {
    createOrOpenDb: createOrOpenDb,
    insert: insert,
    getCount: getCount,
    connectToDb: connectToDb,
    init: init
};
