'use strict';
const MongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');

const execute = (query) => {
    const ret = new Rx.Subject();
let items = [];
    MongoRepository.query('squads', {})
        .subscribe(function (x) {
            items.push(x);
        }, function (err) {

        }, function () {
            console.log(items);
            ret.next({name: 'FetchSquadsEvent', data: items});
        });
    return ret;
};

const verify = (query) => {
    return [];
};

module.exports = {
    verify: verify,
    execute: execute,
    getQuery: () => "FetchSquads"
};
