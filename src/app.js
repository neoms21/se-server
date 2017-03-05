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
const SocketHandler = require('./comms/socket-handler');

let logStreams = [];
if (process.env.NODE_ENV === 'dev') {
    logStreams.push({
        level: 'debug',
        stream: process.stdout            // log debug and above to stdout for dev
    });
}

// create our logger
const log = logger.createLogger({
    name: 'Sports Editor',
    serializers: {
        req: logger.stdSerializers.req
    },
    streams: logStreams.concat({
        level: 'info',
        path: './sports-editor.log'  // log INFO and above to an file
    })
});

// our psuedo singletons need init
MongoRepository.init(log);
CommandMediator.init(log);
EventMediator.init(log);
QueryMediator.init(log);
SocketHandler.init(io, log);

//check db
log.info("DB being checked for collections");
MongoRepository.createOrOpenDb();

// app.get('/', function (req, res) {
//     res.sendfile('index.html');
// });


// load any denormalizers
DeNormalizerManager.init(log);

// any express routes
openRoutes(app, log);

http.listen(8180, function () {
    console.log('listening on *:8180');
});

