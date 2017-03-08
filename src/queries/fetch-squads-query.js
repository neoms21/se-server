'use strict';
const MongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');

const execute = () => {
    const ret = new Rx.Subject();
    let items = [];
    MongoRepository.query('squads', {})
        .subscribe(function (x) {
            items.push(x);
        }, function (err) {

        }, function () {
            let event = EventFactory.createFromQuery(this.query, 'FetchSquadsEvent', false);
            event.messageNumber = 1;
            event.maxMessages = 1;
            event.data = items;
            ret.next(event);
        });
    return ret;
};

const verify = () => {
    // send back empty
    return Rx.observable.empty();
};

module.exports = {
    verify: verify,
    execute: execute,
    getQuery: () => "FetchSquads"
};
