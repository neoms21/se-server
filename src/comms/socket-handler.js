'use strict';
const commandMediator = require('./../cqrs/command-mediator');
const mongoRepository = require('./../db/mongo-repository');
const EventMediator = require('./../cqrs/event-mediator');
const EventFactory = require('./../cqrs/event-factory');
const jwtSecret = require('../cqrs/jwtSecret');
const socketioJwt = require('socketio-jwt');

let logger;
let clients = [];

const processSockets = (io, log) => {
    logger = log;

    // add authentication middleware
    io.use(function(socket, next) {
        var handshakeData = socket.request;
        //console.log(handshakeData)
        // make sure the handshake data looks good

        let handshake = socketioJwt.authorize({
            secret: jwtSecret,
            handshake: true
        });
        // if error do this:
        // next(new Error('not authorized');
        // else just call next
        next();
    });

    io.on('connection', function (socket) {
        log.info('a user connected on socket ' + socket.handle);
        clients.push(socket);

        socket.on('command', function (cmdReq) {
            log.info('command received: ' + JSON.stringify(cmdReq));
            const cmd = commandMediator.createCommand(cmdReq, socket.id);
            commandMediator.dispatch(cmd);
        });
    });
};

const postAuthenticate = (socket, data) => {
    mongoRepository.query('logins', {email: data.username})
        .subscribe((user) => {
            socket.client.user = user;
            logger.info(`User ${data.email} has successfully logged in on socket ${socket.id}`);
            // send event to client with user details
            let event = EventFactory.create({}, 'LoginSuccessful', false);
            event.user = { userName: user.email, name: user.name};
            EventMediator.dispatch(event);
        });
};

const disconnect = (socket) => {
    logger.info(socket.handle + ' disconnected');
    const clientIndex = clients.findIndex(client => client.handle === socket.handle);
    if(clientIndex > -1) {
        clients.splice(clientIndex, 1);
    }
};

const init = () => {
    // listen for events and send them out
    EventMediator.propagator.subscribe(function(ev) {
        //io.emit('event', ev);
    });
};

init();


module.exports = processSockets;