var MongoRepository = require('../db/mongo-repository');
var Rx = require('rxjs');

var eventMediator = {};

eventMediator.init = function (logger) {
    this.logger = logger;
    this.propagator = new Rx.Subject();
};

eventMediator.dispatch = function (event) {
    this.logger.info('Dispatching event ' + event.eventName);

    // save the event
    MongoRepository.insert('events', event);

    // publish it to whomever is listening
    this.propagator.next(event);

    // log it
    this.logger.info('Event ' + event.eventName + ' dispatched');
};

exports = eventMediator;
