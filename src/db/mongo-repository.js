'use strict';
const config = require('config');
const mongoClient = require('mongodb');
const Rx = require('rxjs/Rx');
const util = require('util');

let logger;

const init = (log) => {
    logger = log;
};

const connectToDb = () => {

    const configDB = config.get("dbConfig");

    // create uri no user
    const uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
    logger.info('Trying to connect to ' + uri + ' for db');

    // Connect to the db
    return mongoClient.connect(uri);

};

const getCount = (collectionName, param) => {
    let response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
            db.collection(collectionName).count(param)
                .then(function (count) {
                    response.next(count);
                    response.complete();
                    db.close();
                })
                .catch(function (err) {
                    response.error(err);
                    logger.error(err);
                    db.close();
                });
        }, function(err){
            console.log(err);
        });

    return response;
};

const insert = (collectionName, insertion) => {
    let response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
                db.collection(collectionName).insertOne(insertion)
                    .then(function (succ) {
                            response.next(succ);
                            response.complete();
                            db.close();
                        }
                    )
                    .catch(function (errInsert) {
                            response.error(errInsert);
                            logger.error(errInsert);
                            db.close();
                        }
                    );
            }, function (err) {
                response.error(err);
            }
        );

    return response;
};

const createCollection = (db, name) => {
    db.createCollection(name, function (err, collection) {
        if (util.isNullOrUndefined(err)) {
            logger.info('[Db] - created ' + name + ' collection');
        } else {
            logger.error('[Db] - trying to create ' + name + ' collection, error ' + err.toString());
        }
    });
};

const createOrOpenDb = () => {
    let response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
            createCollection(db, 'commands');
            createCollection(db, 'events');
            createCollection(db, 'clubs');
            createCollection(db, 'teams');
            createCollection(db, 'logins');
            db.close();
        })
        .catch(function (err) {
                response.error(err.toString());
                db.close();
            }
        );

    return response;
};

const query = (collectionName, filters) => {
    let response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
            const cursor = db.collection(collectionName).find(filters); // use internal mongo function
let items = [];
            // cursor.count(function(err, count) {
            //     log.info('query count ' + count)
            // });

            cursor.forEach((item) => {
                response.next(item);
            }, (err) => {
                console.log(err);// error or complete!
                if (err === null) {
                    // console.log(items);
                    //cursor done
                    response.complete();
                } else {
                    response.error(err);
                }
                db.close();
            });
        })
        .catch(function (err) {
            response.error(err);
            db.close();
        });

    return response;
};

module.exports = {
    createOrOpenDb: createOrOpenDb,
    insert: insert,
    getCount: getCount,
    connectToDb: connectToDb,
    query: query,
    init: init
};
