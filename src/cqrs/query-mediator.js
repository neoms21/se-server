'use strict';
const path = require('path');
const Filehound = require('filehound');
const EventMediator = require('./event-mediator');
const EventFactory = require('./event-factory');
const queryVerifier = require('./query-verifier');

let mappings = [];
let logger;

function init(log) {
    logger = log;
    mappings = []; //

    // find all the handlers
    Filehound.create()
        .ext('js')
        .paths(process.cwd() + '/src/queries')
        .match('*-tests*') // ignore tests with the not()
        .not()
        .find((err, filenames) => {
            if (err) {
                logger.error("error finding handlers ", err);
            } else {
                filenames.forEach(function (filename) {

                    // instantiate so we can get command
                    let instance = require(filename);

                    if (instance !== undefined) {
                        let mapping = {query: instance.getQuery(), handler: instance};
                        // add to our list
                        mappings.push(mapping);
                        log.info('Added query ' + mapping.query);
                    }
                });
            }
        });
}

let createError = function (query, responses) {
    let event = EventFactory.QueryVerificationFailed(query);
    event.errors = responses;
    logger.error(responses);
    EventMediator.dispatch(event);
};

function dispatch(query) {

    let mapping = mappings.find(function (mapping) {
        return mapping.query === query.properties.queryName;
    });

    if (mapping === undefined) {
        // oops
        createError(query, {'@#@': 'Unable to create handler for query ' + query.properties.queryName});
        return;
    }

    // now verify and execute mapping

    // check generic query settings
    let checks = queryVerifier.verify(query);
    if (checks.length > 0) {
        // there were errors
        createError(query, checks);
        return;
    }

    // get handler
    let handler = mapping.handler;
    handler.query = query;

    handler.verify()
        .reduce((oldVal, newVal) => {
            oldVal[Object.keys(newVal)[0]] = newVal; // get responses as object
            return oldVal;
        })// get keys for the results from verify
        .subscribe((responses) => { // we get object with keys set as response names
            const messageLength = Object.keys(responses).length;

            // verifier has run , so lets get its results
            if (messageLength === 0) {
                handler.execute() // all ok, so run it
                    .subscribe(resp => {
                        let event = EventFactory.createFromQuery(query, resp.name, false);
                        event.messageNumber = resp.msgNum;
                        event.maxMessages = resp.maxMsgs;
                        event.data = resp.data;

                        EventMediator.dispatch(event);
                    }, err => {
                        createError(query, err);
                    }, () => {
                        logger.info(`Query ${query.properties.queryName} executed successfully`);
                    });
            } else {
                // verification errors found
                createError(query, responses);
            }
        }, (err) => {
            createError(query, {'@#@': err.toString()}); //todo: not sure about this @#@
        });
}

module.exports = {
    init: init,
    dispatch: dispatch
};
