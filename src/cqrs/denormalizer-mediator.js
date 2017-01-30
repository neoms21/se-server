'use strict';
//var path = require('path');
//var Rx = require('rxjs');
const Filehound = require('filehound');
const EventMediator = require('./event-mediator');

let mappings;
let logger;

function init(log) {
    logger = log;

    // set up which messages go to which components
    mappings = []; // make sure it's clear

    log.info('Denormalizer loading from ' + process.cwd() + '/src/denormalizers');
    // find all the handlers
    Filehound.create()
        .ext('js')
        .paths(process.cwd() + '/src/denormalizers')
        .match('!(*-test*)*')
        .find(function (err, filenames) {
            if (err) {
                logger.error("error finding denormalizers ", err);
            } else {
                filenames.forEach(function (filename) {

                    // instantiate so we can get messages
                    let instance = require(filename);

                    if (instance !== undefined) {
                        let mapping = { messages: instance.getMessages(), handler: instance };
                        mappings.push(mapping);
                    }
                });

                mappings.forEach(function (mp) {
                    log.info('Added denormalizer for message ' + mp.message);
                });
            }
        });

    EventMediator.propagator.subscribe((evnt) => {

        logger.info('Denormalizer running for event ' + JSON.stringify(evnt));
        // find the event in our map, or not
        let found = mappings.find(mp => mp.messages.find(m => m === evnt.eventName) !== undefined);
        console.log(' found ' + JSON.stringify(found));
        if (found !== undefined) {
            found.handler(evnt); // execute it & pass event
        }
    });
}


exports = module.exports = {
    init: init
};