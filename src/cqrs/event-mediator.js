'use strict';
const mongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs/Rx');
const util = require('util');

let logger;
let propagator = new Rx.Subject();

function init(log) {
    logger = log;
}

function dispatch(event) {

    if(util.isNullOrUndefined(event.properties)) {
        throw new Error('Event dispatched without properties - ' + JSON.stringify(event));
    }

    if(util.isNullOrUndefined(event.properties.eventName)) {
        throw new Error('Event dispatched without name - ' + JSON.stringify(event));
    }

    logger.info('Dispatching event ' + event.properties.eventName);

    // save the event
    mongoRepository.insert('events', event);

    // publish it to whomever is listening
    propagator.next(event);

    // log it
    logger.info('Event ' + event.properties.eventName + ' dispatched');
}

module.exports = {
    init: init,
    dispatch: dispatch,
    propagator: propagator
};
