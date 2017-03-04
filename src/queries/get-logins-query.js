'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');

const execute = (query) => {
    const ret = new Rx.Subject();

    MongoRepository.count('logins')
        .subscribe(cnt => {
            const maxMsgs = cnt / config.pageSize + 1;
            let msgNum = 0;
            // now get the data
            MongoRepository.query('logins', {})
                .bufferWithCount(config.pageSize) // collect in pagesize chunks
                .subscribe(resp => {
                    ret.next({name: 'LoginQueryEvent', msgNum: ++msgNum, maxMsgs: maxMsgs, data: resp});
                }, err => {
                    ret.error(err);
                }, () => {
                    ret.complete(); // tell mediator we are done
                });
        }, err => {
            ret.error(err);
        });

    return ret;
};

const verify = (query) => {
    return [];
};

module.exports = {
    verify: verify,
    execute: execute,
    getQuery: () => "GetLoginsQuery"
};
