'use strict';
const commandMediator = require('./cqrs/command-mediator');
const socketioAuth = require('socketio-auth');
const mongoRepository = require('./db/mongo-repository');

const processSockets = (io, log) => {
    socketioAuth(io, {
        authenticate: (socket, data, callback) => {
            mongoRepository.getCount('logins', {email: data.email, password: data.password });
        
        }
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

module.exports = processSockets;