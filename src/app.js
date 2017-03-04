'use strict';
const logger = require('bunyan');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const MongoRepository = require('./db/mongo-repository');
const CommandMediator = require('./cqrs/command-mediator');
const EventMediator = require('./cqrs/event-mediator');
const QueryMediator = require('./cqrs/query-mediator');
const DeNormalizerManager = require('./cqrs/denormalizer-mediator');
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
MongoRepository.init(log);
CommandMediator.init(log);
EventMediator.init(log);
QueryMediator.init(log);

//check db
log.info("DB being checked for collections");
MongoRepository.createOrOpenDb();

// app.get('/', function (req, res) {
//     res.sendfile('index.html');
// });

// sockets related
socketHandler(io, log);

// load any denormalizers
DeNormalizerManager.init(log);

// any express routes
openRoutes(app, log);

http.listen(8180, function () {
    console.log('listening on *:8180');
});

