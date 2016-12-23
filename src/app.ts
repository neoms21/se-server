import * as logger from 'bunyan';
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

import MongoRepository from './db/mongo-repository';
import {CommandMediator} from './cqrs/command-mediator';
import {CommandRequest} from './bases/CommandRequest';
import {EventMediator} from './cqrs/event-mediator';
import {IEvent} from './bases/IEvent';
//const commandRoutes = require('./routes/commandRoutes');


// create our logger
let log = logger.createLogger({
    name: 'Sports Editor',
    serializers: {
        req: logger.stdSerializers.req
    }
});

// our psuedo singletons need init
CommandMediator.init(log);
EventMediator.init(log);

//check db
log.info("DB being checked for collections");
MongoRepository.createOrOpenDb()
    .subscribe((c:any) => log.info(c.name), (err:any) => log.error(err.toString()));

app.get('/', function (req: any, res: any) {
    res.sendfile('index.html');
});

io.on('connection', function (socket: any) {
    console.log('a user connected');

    socket.on('command', (cmdReq: CommandRequest) => {
        log.info('command received: ' + JSON.stringify(cmdReq));
        let cmd = CommandMediator.createCommand(cmdReq);
        CommandMediator.dispatch(cmd);
    });

});

EventMediator.propagator.subscribe((ev: IEvent) =>  {
    console.log('@@@ ' + ev.constructor.name);
    io.emit(ev.constructor.name, ev);
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


