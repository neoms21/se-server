'use strict';
const commandMediator = require('./../cqrs/command-mediator');
const mongoRepository = require('./../db/mongo-repository');
const EventMediator = require('./../cqrs/event-mediator');
const EventFactory = require('./../cqrs/event-factory');
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

        socket.on('authentication', (auth) => {

            // check the token



                       const client = clients.find(client => client.id === socket.id);
            if (client !== undefined) {
                client.token = auth.token;
                log.info('Authenticated socket ' + socket.id);
            }
        });

        socket.on('disconnect', () => disconnect(socket));

        socket.on('command', (cmdReq) => {
            log.info('command received: ' + JSON.stringify(cmdReq));

            // check to see if the command can be run
            if (isCommandAllowed(socket.id, cmdReq)) {
                const cmd = commandMediator.createCommand(cmdReq, socket.id);
                commandMediator.dispatch(cmd);
            }
        });
    });
};

const isCommandAllowed = (socketId, cmdReq) => {
    const client = clients.find(cl => cl.id === socketId);
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

const disconnect = (socket) => {
    logger.info(socket.id + ' disconnected');
    const clientIndex = clients.findIndex(client => client.id === socket.id);
    if (clientIndex > -1) {
        clients.splice(clientIndex, 1);
    }
};

const init = () => {
    // listen for events and send them out
    EventMediator.propagator.subscribe(function (ev) {
        sio.emit('event', ev);
    });
};

init();


module.exports = processSockets;