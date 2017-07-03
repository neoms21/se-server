'use strict';
const MongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs');
const logger = require('../core/logger').logger();
const EventFactory = require('./../cqrs/event-factory');
const execute = (query) => {

    const ret = new Rx.Subject();
    let items = [];
    console.log('in fetch squads', query);
    MongoRepository.query('squads', {
        "_id": {$ne: ''}, "userId": {$eq: query.payload.userId}
    }, {"players": 0, "userId": 0})
        .subscribe(function (x) {
            items.push(x);
        }, function (err) {
            logger.error(err);
        }, function () {
            logger.info(items);
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
