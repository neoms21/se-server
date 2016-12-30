'use strict';
var mongoRepository = require('../db/mongo-repository');
var Rx = require('rxjs');

var logger;
var propagator = new Rx.Subject();

function init(log) {
    logger = log;
}

function dispatch(event) {
    logger.info('Dispatching event ' + event.eventName);

    // save the event
    mongoRepository.insert('events', event);

    // publish it to whomever is listening
    propagator.next(event);

    // log it
    logger.info('Event ' + event.eventName + ' dispatched');
}

module.exports = {
    init: init,
    dispatch: dispatch,
    propagator: propagator
};
