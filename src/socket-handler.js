'use strict';
const commandMediator = require('./cqrs/command-mediator');
const socketioAuth = require('socketio-auth');
const mongoRepository = require('./db/mongo-repository');
const eventMediator = require('./cqrs/event-mediator');
const eventFactory = require('./cqrs/event-factory');

let logger;

const processSockets = (io, log) => {
    logger = log;

    socketioAuth(io, {
        authenticate: authenticate,
        postAuthenticate: postAuthenticate,
        disconnect: disconnect,
        timeout: 1000
    });

    io.on('connection', function (socket) {
        log.info('a user connected');

        socket.on('command', function (cmdReq) {
            log.info('command received: ' + JSON.stringify(cmdReq));
            const cmd = commandMediator.createCommand(cmdReq);
            commandMediator.dispatch(cmd);
        });

    });
};

const authenticate = (socket, data, callback) => {
    // attempt to match by email and password
    mongoRepository.getCount('logins', {email: data.username, password: data.password})
        .subscribe((cnt) => {
            if (cnt === 0) {
                // no matching user & password
                return callback(new Error("Email not found or password doesn't match"));
            } else {
                // matched!
                callback(null, true);
            }
        });
};

const postAuthenticate = (socket, data) => {
    mongoRepository.query('logins', {email: data.username})
        .subscribe((user) => {
            socket.client.user = user;
            logger.info(`User ${data.email} has successfully logged in on socket ${socket.id}`);
            // send event to client with user details
            let event = eventFactory.create({}, 'LoginSuccessful', false);
            event.user = { userName: user.email, name: user.name};
            eventMediator.dispatch(event);
        });
};

const disconnect = (socket) => {
    logger.info(socket.id + ' disconnected');
};

module.exports = processSockets;