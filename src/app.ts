import * as uuid from 'uuid';
import * as logger from 'bunyan';
import * as restify from 'restify';
import * as socketio from 'socket.io';
import MongoRepository from './db/mongo-repository';
const commandRoutes = require('./routes/commandRoutes');
const commandMediator = require('./cqrs/command-mediator');

// create our logger
let log = logger.createLogger({
    name: 'Sports Editor',
    serializers: {
        req: logger.stdSerializers.req
    }
});

let server = restify.createServer({
    name: 'Sports Editor',
    version: '0.0.1',
    log: log
});

// add socket.io
const io = socketio.listen(server);

// add middleware
//server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// log requests
server.pre(function (request, response, next) {
    log.info({req: JSON.stringify(request.body)}, 'REQUEST' + JSON.stringify(request.body));
    // add correlation id
    response.header('correlation', uuid.v4());
    next();
});

// socket io
io.sockets.on('connection', function (socket) {
    socket.emit('news', {hello: 'world'});
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

// actions need init
commandMediator.init(log);

//check db
MongoRepository.createOrOpenDb();
log.info("Collections checked (and maybe created)");

//server.bodyParser();

// add routes
commandRoutes(server);

server.listen(8180, function () {
    console.log('%s listening at %s', server.name, server.url);
});


