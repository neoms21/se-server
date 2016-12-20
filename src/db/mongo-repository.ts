import * as config from 'config';
import {MongoClient as mongoClient} from 'mongodb';
import * as Rx from 'rx';
import {DbConfig} from '../../config/dbConfig';

export default class MongoRepository {

    private static connectToDb() {
        const configDB:DbConfig = config.get<DbConfig>("dbConfig");

        // create uri no user
        let uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
        //log.info('trying to connect to ' + uri + ' to initialise');

        // Connect to the db
        //noinspection TypeScriptUnresolvedFunction
        return mongoClient.connect(uri);
    }

    public static getCount(collectionName, param) {
        // so many layers of rx!
        let response = new Rx.Subject();

        this.connectToDb()
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

    public static insert(collectionName, insertion) {
        let response = new Rx.Subject();

        this.connectToDb()
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

    public static createOrOpenDb() {
        this.connectToDb()
            .then(function (db) {
                db.createCollection('commands', function (err, collection) {
                });
                db.createCollection('events', function (err, collection) {
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
}

//
// module.exports = {
//     getCount: getCount,
//     insert: insert,
//     createOrOpenDb: createOrOpenDb
// };
