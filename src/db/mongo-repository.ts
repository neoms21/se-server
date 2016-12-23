import * as config from 'config';
import {MongoClient as mongoClient, Db, Collection, InsertOneWriteOpResult} from 'mongodb';
import * as Rx from 'rxjs';
import {DbConfig} from '../../config/dbConfig';

export default class MongoRepository {
    private static connection: Promise<Db>;


    private static connectToDb(): Promise<Db> {

        if (this.connection === undefined) {

            const configDB: DbConfig = config.get<DbConfig>("dbConfig");

            // create uri no user
            let uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
            //console.log('trying to connect to ' + uri + ' to initialise');

            // Connect to the db
            this.connection = mongoClient.connect(uri);
        }

        return this.connection;
    }

    public static getCount(collectionName: string, param: any): Rx.Observable<number> {
        // so many layers of rx!
        let response = new Rx.Subject<number>();

        this.connectToDb()
            .then((db: Db) => {
                db.collection(collectionName).count(param, (err: any, count: number) => {
                    response.next(count);
                    response.complete();
                });
            }, (err: any) => {
                response.error(err);
            });

        return response;
    }

    public static insert(collectionName: string, insertion: any) {
        let response = new Rx.Subject();

        this.connectToDb()
            .then((db: Db) => {
                db.collection(collectionName).insertOne(insertion)
                    .then((succ: InsertOneWriteOpResult) => {
                        response.next(succ);
                        response.complete();
                    })
                    .catch((errInsert: any) => {
                        response.error(errInsert);
                    });
            }, (err: any) => {
                response.error(err);
            });

        return response;
    }

    public static createOrOpenDb(): Rx.Observable<string> {
        let response = new Rx.Subject<string>();

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
            })
            .catch((err: any) => response.error(err.toString()));

        return response;
    }
}

//
// module.exports = {
//     getCount: getCount,
//     insert: insert,
//     createOrOpenDb: createOrOpenDb
// };
