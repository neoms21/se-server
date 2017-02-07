'use strict';
const logger = require('bunyan');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const mongoRepository = require('./db/mongo-repository');
const commandMediator = require('./cqrs/command-mediator');
const eventMediator = require('./cqrs/event-mediator');
const deNormalizerManager = require('./cqrs/denormalizer-mediator');
const openRoutes = require('./comms/open-routes');
const socketHandler = require('./comms/socket-handler');

// create our logger
const log = logger.createLogger({
    name: 'Sports Editor',
    serializers: {
        req: logger.stdSerializers.req
    },
    streams: [
        {
            level: 'info',
            stream: process.stdout            // log INFO and above to stdout
        },
        {
            level: 'error',
            path: './sports-editor-error.log'  // log ERROR and above to a file
        }]
});

// our psuedo singletons need init
mongoRepository.init(log);
commandMediator.init(log);
eventMediator.init(log);

io.set('transports', [ 'websocket' ]);
//check db
log.info("DB being checked for collections");
mongoRepository.createOrOpenDb();

// app.get('/', function (req, res) {
//     res.sendfile('index.html');
// });

// sockets related
socketHandler(io, log);

// load any denormalizers
deNormalizerManager.init(log);

// any express routes
openRoutes(app, log);

http.listen(8180, function () {
    console.log('listening on *:8180');
});

