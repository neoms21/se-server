'use strict';
const config = require('config');
const mongoClient = require('mongodb');
const Rx = require('rxjs/Rx');
const util = require('util');
const ObjectId = require('mongodb').ObjectId;
const GeneralServices = require('../cqrs/general-services');

let logger;

const init = (log) => {
  logger = log;
};

const connectToDb = () => {

  const configDB = config.get('dbConfig');

  // create uri no user
  const uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
  logger.info('Trying to connect to ' + uri + ' for db');

  // Connect to the db
  return mongoClient.connect(uri);
};

const getCount = (collectionName, query) => {
  let response = new Rx.Subject();

  connectToDb()
    .then(function (db) {
      db.collection(collectionName).count(query)
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
    }, function (err) {
      logger.error(err);
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
        })
        .catch(function (errInsert) {
          response.error(errInsert);
          logger.error(errInsert);
          db.close();
        });
    }, function (err) {
      response.error(err);
    });

  return response;
};

function updateRecord(collectionName, key, updates, response) {

    connectToDb().then(function (db) {
        db.collection(collectionName)
            .updateOne({_id: new ObjectId(key)},
                {$set: updates})
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
    });

}

const update = (collectionName, key, propsToUpdate) => {
    let response = new Rx.Subject();
    updateRecord(collectionName, key, propsToUpdate, response);
    return response;
};

const deleteRecord = (collectionName, id) => {
    let response = new Rx.Subject();
    updateRecord(collectionName, id,
        {isDeleted: true, "properties.modified": new Date()}, response);
    return response;
};

const createCollection = (db, name) => {
    db.createCollection(name, function (err) {
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

      Promise.all([createCollection(db, 'commands'),
        createCollection(db, 'events'),
        createCollection(db, 'clubs'),
        createCollection(db, 'squads'),
        createCollection(db, 'logins')]).then(([result1, result2]) => {
        db.close();
      })
        .catch(err => {
          logger.error(err);
          db.close();
        });
    })
    .catch(function (err) {
      response.error(err.toString());
      db.close();
    });

  return response;
};

const query = (collectionName, conditions, filters) => {
  let response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
            let recordsFound = false;
            //const cursor = collection.find.apply(this, params)
            if (!conditions) {
                conditions = {};
            }

            conditions.isDeleted = {$ne: true};
            const cursor = db.collection(collectionName).find(conditions, filters); // use internal mongo function
            cursor.forEach((item) => {
                recordsFound = true;
                response.next(item);
            }, (err) => {
                if (err === null) {
                    if (!recordsFound) {
                        response.next(false); // To let the listening party know that no records were found, can't use count in every scenario
                    }

                    response.complete();
                } else {
                    response.error(err);
                }
                //  db.close();
            });
        })
        .catch(function (err) {
            response.error(err);
            // db.close();
        });

    return response;
};

const aggregateQuery = (collectionName, conditions, filters) => {
    let response = new Rx.Subject();

    connectToDb()
        .then(function (db) {
            //const cursor = collection.find.apply(this, params)
            if (!conditions) {
                conditions = {};
            }

            conditions.isDeleted = {$ne: true};
            const cursor = db.collection(collectionName).aggregate(conditions, filters); // use internal mongo function


            cursor.forEach((item) => {
                response.next(item);
            }, (err) => {
                if (err === null) {
                    // console.log(items);
                    //cursor done
                    response.complete();
                } else {
                    response.error(err);
                }
                //  db.close();
            });
        })
        .catch(function (err) {
            response.error(err);
            // db.close();
        });

  return response;
};

module.exports = {
    createOrOpenDb: createOrOpenDb,
    insert: insert,
    getCount: getCount,
    update: update,
    deleteRecord: deleteRecord,
    connectToDb: connectToDb,
    query: query,
    aggregateQuery: aggregateQuery,
    init: init
};
