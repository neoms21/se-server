'use strict';
const commandMediator = require('./../cqrs/command-mediator');
const mongoRepository = require('./../db/mongo-repository');
const EventMediator = require('./../cqrs/event-mediator');
const EventFactory = require('./../cqrs/event-factory');
const jwtSecret = require('../cqrs/jwtSecret');
const socketioJwt = require('socketio-jwt');

let logger;
let clients = [];
let sio;

const processSockets = (io, log) => {
    logger = log;
    sio = io;

    // add authentication middleware
    // io.use(function(socket, next) {
    //     var handshakeData = socket.request;
    //     //console.log(handshakeData)
    //     // make sure the handshake data looks good
    //
    //     console.log(socket.headers)
    //
    //     // let handshake = socketioJwt.authorize({
    //     //     secret: jwtSecret,
    //     //     handshake: false
    //     // });
    //     // if error do this:
    //     // next(new Error('not authorized');
    //     // else just call next
    //     next();
    // });

    io.on('connection', function (socket) {
        log.info('a user connected on socket ' + socket.id);
        clients.push(socket);

        socket.on('authentication', (auth) => {
            console.log('auth ' + JSON.stringify(auth))
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

// const postAuthenticate = (socket, data) => {
//     mongoRepository.query('logins', {email: data.username})
//         .subscribe((user) => {
//             socket.client.user = user;
//             logger.info(`User ${data.email} has successfully logged in on socket ${socket.handle}`);
//             // send event to client with user details
//             let event = EventFactory.create({}, 'LoginSuccessful', false);
//             event.user = { userName: user.email, name: user.name};
//             EventMediator.dispatch(event);
//         });
// };

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