import * as uuid from 'uuid';
import * as logger from 'bunyan';
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

import MongoRepository from './db/mongo-repository';
import {CommandMediator} from './cqrs/command-mediator';
//const commandRoutes = require('./routes/commandRoutes');
//const commandMediator = require('./cqrs/command-mediator');

// create our logger
let log = logger.createLogger({
    name: 'Sports Editor',
    serializers: {
        req: logger.stdSerializers.req
    }
});

// actions need init
CommandMediator.init(log);

//check db
MongoRepository.createOrOpenDb();
log.info("Collections checked (and maybe created)");

app.get('/', function (req: any, res: any) {
    res.sendfile('index.html');
});

io.on('connection', function (socket: any) {
    console.log('a user connected');

    socket.on('command', (msg: any) => {
        log.info('command received: ' + JSON.stringify(msg));
        CommandMediator.dispatch()
    });
});

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


