'use strict';
const commandMediator = require('./../cqrs/command-mediator');
const EventMediator = require('./../cqrs/event-mediator');
const EventFactory = require('./../cqrs/event-factory');
const QueryMediator = require('./../cqrs/query-mediator');
const Util = require('util');
const verifier = require('./jwtVerifier');

let logger;
let clients = [];
let sio;
let eventSubscription;

const isCommandAllowed = (socketId, cmdReq) => {
    logger.debug('Checking socket ' + socketId);
    const client = clients.find(cl => cl.id === socketId);
    logger.debug('Client Found' + client);
    if (client === undefined) {
        logger.error('Command received by socket, but unable to find client ' + socketId);
        return false;
    }

    // check if command can be run without authentication
    if (cmdReq.properties.commandName === 'RegisterUser') {
        return true;

    }

    // check authenticated
    if (client.token === undefined) {
        logger.error(`Command received by socket, but socket ${socketId} not authenticated`);
        return false;
    }

    // todo : check if user is authorised

    return true;
};

const isQueryAllowed = (socketId) => {
    const client = clients.find(cl => cl.id === socketId);
    if (client === undefined) {
        return false;
    }

    // // check if command can be run without authentication
    // if (queryReq.properties.queryName === 'GetLogins') {
    //     return true;
    // }
    console.log('Client Token:->', client.token);
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

const authenticate = (token, socketId) => {
    console.log('In authenticate', token, socketId)
    // check the token
    verifier.verify(token, (err) => {
        if (err !== null) {
            logger.error(`'Authentication token didnt match for socket ${socketId} error ${err}`);
            let event = EventFactory.createFromNone('AuthenticationFailed', true);
            event.error = 'Authentication token didnt match for socket ' + socketId;
            EventMediator.dispatch(event);
        } else {
            // was ok, get the socket
            const client = clients.find(client => client.id === socketId);
            if (client !== undefined) {
                client.token = token;
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

const processCommand = (cmd, socket) => {
    logger.info('Command received by socket: ' + JSON.stringify(cmd));

    // check to see if the command can be run
    if (isCommandAllowed(socket.id, cmd)) {
        cmd.properties.clientId = socket.id;
        commandMediator.dispatch(cmd);
    }
};

const processQuery = (query, socket) => {
    logger.info('Query received: ' + JSON.stringify((query)));

    // check to see if the command can be run
    if (isQueryAllowed(socket.id, query)) {
        query.properties.clientId = socket.id;
        QueryMediator.dispatch(query);
    }
};

const dealWithEvents = (ev) => {

    let topic = 'event';
    let clientId;

    if (!Util.isNullOrUndefined(ev.command)) {
        topic = 'commandEvent';
        clientId = ev.command.properties.clientId;
    } else {
        if (!Util.isNullOrUndefined(ev.query)) {
            topic = 'queryEvent';
            clientId = ev.query.properties.clientId;
        }
    }

    // now send it
    logger.debug(`Sending event ${ev.properties.eventName} to client ${clientId}`);
    if (clientId !== undefined) {
        // find the client connection
        let clientSocket = clients.find((item) => item.id === clientId);
        if (clientSocket !== undefined) {
            // send event to that specfic client
            clientSocket.emit(topic, ev);
        } else {
            logger.error(`Couldnt find client connection for id ${clientId} for event ${ev.properties.eventName}`);
        }
    } else {
        // send to all
        sio.emit(topic, ev);
    }
};

const init = (io, log) => {
    logger = log;
    sio = io;

    // listen for events and send them out
    eventSubscription = EventMediator.propagator.subscribe(dealWithEvents);

    io.set('transports', ['websocket']);

    io.on('connection', function (socket) {
        logger.info('a user connected on socket ' + socket.id);
        clients.push(socket);

        socket.on('authentication', (auth) => authenticate(auth, socket.id));
        socket.on('disconnect', () => disconnected(socket));
        socket.on('command', (cmdReq) => processCommand(cmdReq, socket));
        socket.on('query', (queryReq) => processQuery(queryReq, socket));
    });
};

const destroy = () => {
    eventSubscription.unsubscribe();
};

module.exports = {
    init: init,
    destroy: destroy
};