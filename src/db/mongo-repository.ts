import * as config from 'config';
import {MongoClient as mongoClient, Db, Collection} from 'mongodb';
import * as Rx from 'rx';
import {DbConfig} from '../../config/dbConfig';

export default class MongoRepository {

    private static connectToDb() {
        const configDB: DbConfig = config.get<DbConfig>("dbConfig");

        // create uri no user
        let uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
        //log.info('trying to connect to ' + uri + ' to initialise');

        // Connect to the db
        //noinspection TypeScriptUnresolvedFunction
        return mongoClient.connect(uri);
    }

    public static getCount(collectionName: string, param: any): Rx.Observable<number> {
        // so many layers of rx!
        let response = new Rx.Subject<number>();

        this.connectToDb()
            .then((db: Db) => {
                db.collection(collectionName).count(param, (err: any, count: number) => {
                    response.onNext(count);
                    response.onCompleted();
                });
            }, (err: any) => {
                response.onError(err);
            });

        return response;
    }

    public static insert(collectionName: string, insertion: any) {
        let response = new Rx.Subject();

        this.connectToDb()
            .then((db: Db) => {
                db.collection(collectionName).insertOne(insertion)
                    .then((succ: Collection) => {
                        response.onNext(succ);
                        response.onCompleted();
                    })
                    .catch((errInsert: any) => {
                        response.onError(errInsert);
                    });
            }, (err: any) => {
                response.onError(err);
            });

        return response;
    }

    public static createOrOpenDb() {
        this.connectToDb()
            .then(function (db: Db) {
                db.createCollection('commands', function (err: any, collection: any) {
                });
                db.createCollection('events', function (err: any, collection: any) {
                });
                db.createCollection('checkpoints', function (err: any, collection: any) {
                });
                db.createCollection('clubs', function (err: any, collection: any) {
                });
                db.createCollection('teams', function (err: any, collection: any) {
                });
                db.createCollection('logins', function (err: any, collection: any) {
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
