'use strict';
var logger = require('bunyan');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoRepository = require('./db/mongo-repository');
var commandMediator = require('./cqrs/command-mediator');
var eventMediator = require('./cqrs/event-mediator');
var deNormalizerManager = require('./cqrs/denormalizer-mediator');

// create our logger
var log = logger.createLogger({
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

io.on('connection', function (socket) {
    log.info('a user connected');

    socket.on('command', function(cmdReq) {
        log.info('command received: ' + JSON.stringify(cmdReq));
        var cmd = commandMediator.createCommand(cmdReq);
        commandMediator.dispatch(cmd);
    });

});

// send out events
eventMediator.propagator.subscribe(function(ev) {
    io.emit('event', ev);
});

// load any denormalizers
deNormalizerManager.init(log);

http.listen(8180, function () {
    console.log('listening on *:8180');
});


// log requests
// server.pre(function (request, response, next) {
//     log.info({req: JSON.stringify(request.body)}, 'REQUEST ' + JSON.stringify(request.body));
//     // add correlation id
//     response.header('correlation', uuid.v4());
//     next();
// });
//
// // socket io
// io.sockets.on('connection', function (socket) {
//     log.info('connected socket');
//
//     socket.emit('news', {hello: 'world'});
//     socket.on('command', function (command:any) {
//         console.log(command);
//     });
// });


// add routes
// commandRoutes(server);

// server.listen(8180, function () {
//     console.log('%s listening at %s', server.name, server.url);
// });


