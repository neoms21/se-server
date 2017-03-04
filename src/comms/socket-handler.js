'use strict';
const commandMediator = require('./../cqrs/command-mediator');
const mongoRepository = require('./../db/mongo-repository');
const EventMediator = require('./../cqrs/event-mediator');
const EventFactory = require('./../cqrs/event-factory');
const QueryMediator = require('./../cqrs/query-mediator');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../cqrs/jwtSecret');
const Util = require('util');

let logger;
let clients = [];
let sio;

const processSockets = (io, log) => {
    logger = log;
    sio = io;
    io.set('transports', ['websocket']);

    io.on('connection', function (socket) {

        log.info('a user connected on socket ' + socket.id);
        clients.push(socket);

        socket.on('authentication', (auth) => authenticate(auth, socket.id));
        socket.on('disconnect', () => disconnected(socket));
        socket.on('command', (cmdReq) => processCommand(cmdReq, socket));
        socket.on('command', (queryReq) => processQuery(queryReq, socket));
    });
};

const isCommandAllowed = (socketId, cmdReq) => {
    const client = clients.find(cl => cl.id === socketId);
    if (client === undefined) {
        return false;
    }

    // check if command can be run without authentication
    if (cmdReq.properties.commandName === 'RegisterUser') {
        return true;
    }

    // check authenticated
    if (client.token === undefined) {
        return false;
    }

    // todo : check if user is authorised

    return true;
};

const isQueryAllowed = (socketId, queryReq) => {
    const client = clients.find(cl => cl.id === socketId);
    if (client === undefined) {
        return false;
    }

    // check if command can be run without authentication
    if (queryReq.properties.queryName === 'GetLogins') {
        return true;
    }

    // check authenticated
    if (client.token === undefined) {
        return false;
    }

    // todo : check if user is authorised

    return true;
};

const disconnected = (socket) => {
    logger.info(socket.id + ' disconnected');
    const clientIndex = clients.findIndex(client => client.id === socket.id);
    if (clientIndex > -1) {
        clients.splice(clientIndex, 1);
    }
};

const authenticate = (auth, socketId) => {

    // check the token
    jwt.verify(auth.token, jwtSecret, (err) => {
        if (err !== null) {
            logger.error(`'Authentication token didnt match for socket ${socketId} error ${err}`);
            let event = EventFactory.createFromNone('AuthenticationFailed', true);
            event.error = 'Authentication token didnt match for socket ' + socketId;
            EventMediator.dispatch(event);
        } else {
            // was ok, get the socket
            const client = clients.find(client => client.id === socketId);
            if (client !== undefined) {
                client.token = auth.token;
                logger.info('Authenticated socket ' + socketId);
                let event = EventFactory.createFromNone('AuthenticationSucceeded', false);
                EventMediator.dispatch(event);
            } else {
                // failed to find client
                logger.error('Failed to find matching socket ' + socketId);
                let event = EventFactory.createFromNone('AuthenticationFailed', true);
                event.error = 'Failed to find matching socket ' + socketId;
                EventMediator.dispatch(event);
            }
        }
    });
};

const processCommand = (cmdReq, socket) => {
    logger.info('command received: ' + JSON.stringify(cmdReq));

    // check to see if the command can be run
    if (isCommandAllowed(socket.id, cmdReq)) {
        const cmd = Object.assign({}, cmdReq);
        cmd.properties.clientId = socket.id;
        commandMediator.dispatch(cmd);
    }
};

const processQuery = (queryReq, socket) => {
    logger.info('command received: ' + JSON.stringify((queryReq)));

    // check to see if the command can be run
    if (isQueryAllowed(socket.id, queryReq)) {
        const qry = Object.assign({}, queryReq);
        qry.properties.clientId = socket.id;
        QueryMediator.dispatch(qry);
    }
};

const init = () => {

    // listen for events and send them out
    EventMediator.propagator.subscribe(function (ev) {
        let topic = 'event';
        let clientId;

        if (!Util.isNullOrUndefined(ev.command)) {
            topic = 'commandEvent';
            clientId = ev.command.clientId;
        } else {
            if (!Util.isNullOrUndefined(ev.query)) {
                topic = 'queryEvent';
                clientId = ev.query.clientId;
            }
        }

        // now send it
        if (clientId !== undefined) {
            sio.send(topic, ev, clientId);
        } else {
            sio.emit(topic, ev);
        }
    });
};

init();

module.exports = processSockets;