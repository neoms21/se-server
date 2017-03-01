'use strict';
const commandMediator = require('./../cqrs/command-mediator');
const mongoRepository = require('./../db/mongo-repository');
const EventMediator = require('./../cqrs/event-mediator');
const EventFactory = require('./../cqrs/event-factory');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../cqrs/jwtSecret');

let logger;
let clients = [];
let sio;

const processSockets = (io, log) => {
    logger = log;
    sio = io;

    io.on('connection', function (socket) {

        log.info('a user connected on socket ' + socket.id);
        clients.push(socket);

        socket.on('authentication', (auth) => authenticate(auth, socket.id));

        socket.on('disconnect', () => disconnected(socket));

        socket.on('command', (cmdReq) => {
            log.info('command received: ' + JSON.stringify(cmdReq));

            // check to see if the command can be run
            if (isCommandAllowed(socket.id, cmdReq)) {
                const cmd = commandMediator.createCommand(cmdReq, socket.id);
                commandMediator.dispatch(cmd);
            }
            else{
                log.info('command not allowed');
            }
        });
    });
};

const isCommandAllowed = (socketId, cmdReq) => {
    const client = clients.find(cl => cl.id === socketId);
    console.log(client.token);
    if (client === undefined) {
        return false;
    }

    // check if command can be run without authentication
    if (cmdReq.commandName === 'RegisterUser') {
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
            logger.error('Authentication token didnt match for socket ' + socketId);
            let event = EventFactory.create('', 'AuthenticationFailed', true);
            event.error = 'Authentication token didnt match for socket ' + socketId;
            EventMediator.dispatch(event);
        } else {
            // was ok, get the socket
            const client = clients.find(client => client.id === socketId);
            if (client !== undefined) {
                client.token = auth.token;
                logger.info('Authenticated socket ' + socketId);
                let event = EventFactory.create(undefined, 'AuthenticationSucceeded', false);
                EventMediator.dispatch(event);
            } else {
                // failed to find client
                logger.error('Failed to find matching socket ' + socketId);
                let event = EventFactory.create(undefined, 'AuthenticationFailed', true);
                event.error = 'Failed to find matching socket ' + socketId;
                EventMediator.dispatch(event);
            }
        }
    });
};

const init = () => {
    // listen for events and send them out
    EventMediator.propagator.subscribe(function (ev) {
        sio.emit('event', ev);
    });
};

init();

module.exports = processSockets;