'use strict';
const MongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');

const EventFactory = require('./../cqrs/event-factory');
const execute = (query) => {
    const ret = new Rx.Subject();
    let items = [];
    MongoRepository.query('squads', {})
        .subscribe(function (x) {
            items.push(x);
        }, function (err) {

        }, function () {
            console.log(items);
            let event = EventFactory.createFromQuery(query, 'FetchSquadsEvent', false);
            event.messageNumber = 1;
            event.maxMessages = 1;
            event.data = items;
            ret.next(event);
        });
    return ret;
};

const verify = () => {
    // send back empty
    return Rx.Observable.empty();
};

module.exports = {
    verify: verify,
    execute: execute,
    getQuery: () => "FetchSquads"
};
