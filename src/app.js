'use strict';
const logger = require('bunyan');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const mongoRepository = require('./db/mongo-repository');
const commandMediator = require('./cqrs/command-mediator');
const eventMediator = require('./cqrs/event-mediator');
const deNormalizerManager = require('./cqrs/denormalizer-mediator');
//const signingRoutes = require('./routes/signing-routes');
const socketHandler = require('./socket-handler');

// create our logger
const log = logger.createLogger({
    name: 'Sports Editor',
    serializers: {
        req: logger.stdSerializers.req
    }
});

// our psuedo singletons need init
mongoRepository.init(log);
commandMediator.init(log);
eventMediator.init(log);

//check db
log.info("DB being checked for collections");
mongoRepository.createOrOpenDb();

// app.get('/', function (req, res) {
//     res.sendfile('index.html');
// });

// sockets related
socketHandler(io, log);

// send out events
eventMediator.propagator.subscribe(function(ev) {
    io.emit('event', ev);
});

// load any denormalizers
deNormalizerManager.init(log);

// any express routes
//signingRoutes(app, log);

http.listen(8180, function () {
    console.log('listening on *:8180');
});

