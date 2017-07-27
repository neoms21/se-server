'use strict';
const socketHandler = require('./socket-handler');
const assert = require('assert');
const sinon = require('sinon');
const Rx = require('rxjs/Rx');
const jwt = require('jsonwebtoken');
const EventMediator = require('./../cqrs/event-mediator');
const jwtSecret = require('../cqrs/jwtSecret');
const EventEmitter = require('events');
const GeneralServices = require('../cqrs/general-services');

describe('Socket handler', () => {

    describe('setup', () => {
        it('should have been created correctly', () => {
            assert.notEqual(socketHandler, null);
            assert.notEqual(socketHandler, undefined);
        });
    });

    describe('connection', () => {
        let io;
        let socket;
        let logger;
        let loggerErrorSpy;
        let loggerInfoSpy;
        let eventMediatorStub;
        let timeStub;
        let setStub;
        let jwtStub;
        const tod = new Date('01 Sep 2016 08:00');

        beforeEach(() => {
            logger = sinon.stub();
            logger.info = () => {
            };
            logger.error = () => {
            };

            loggerErrorSpy = sinon.spy(logger, 'error');
            loggerInfoSpy = sinon.spy(logger, 'info');
            eventMediatorStub = sinon.stub(EventMediator, 'dispatch');
            timeStub = sinon.stub(GeneralServices, 'getTime').returns(tod);
          jwtStub = sinon.stub(jwt, 'verify').yields('blah');

            // set up common stuff
            io = new EventEmitter();
            io.set = () => {};
            socket = new EventEmitter();
            setStub = sinon.stub(io, 'set');

            socket.id = '123@';
            socketHandler.init(io, logger);
        });

        afterEach(() => {
            loggerErrorSpy.restore();
            loggerInfoSpy.restore();
            eventMediatorStub.restore();
            timeStub.restore();
            setStub.restore();
            jwtStub.restore();
            socketHandler.destroy();
        });

        it('should log when connected', () => {
            io.emit('connection', socket);

            assert(loggerInfoSpy.calledWith('a user connected on socket ' + socket.id));
            socket.emit('disconnect'); // deletes the client
        });

        it('should subscribe to events', () => {
            let onSpy = sinon.spy(socket, 'on');
            io.emit('connection', socket);
            socket.emit('disconnect'); // deletes the client

            assert(onSpy.firstCall.calledWith('authentication'));
            assert(onSpy.secondCall.calledWith('disconnect'));
            assert(onSpy.thirdCall.calledWith('command'));
            onSpy.restore();
        });

        it('should give error if authentication wrong', () => {
             // send error back
            io.emit('connection', socket);
            socket.emit('authentication', {token: '@@@@@'});
            socket.emit('disconnect'); // deletes the client

            assert(eventMediatorStub.called);
            assert(eventMediatorStub.calledWith(
                {
                    properties: {
                        eventName: 'AuthenticationFailed',
                        isFailure: true,
                        modified: sinon.match.date
                    },
                    error: 'Authentication token didnt match for socket 123@'
                }));


        });

        it('should give error if socket wrong', () => {
            jwtStub.restore();
            jwtStub = sinon.stub(jwt, 'verify').yields(null);
            io.emit('connection', socket);
            socket.emit('disconnect'); // deletes the client
            socket.emit('authentication', {token: '@@@@@'});

            assert(eventMediatorStub.called);
            assert(eventMediatorStub.calledWith(
                {
                    properties: {
                        eventName: 'AuthenticationFailed',
                        isFailure: true,
                        modified: sinon.match.date
                    },

                    error: 'Failed to find matching socket 123@'
                }));
        });

        it('should give success if authentication match', () => {
            jwtStub.restore();
            jwtStub = sinon.stub(jwt, 'verify').yields(null);
            io.emit('connection', socket);
            socket.emit('authentication', {token: '@@@@@'});
            // socket.emit('disconnect'); // deletes the client

            assert(eventMediatorStub.called);
            assert(eventMediatorStub.calledWith({
                properties: {
                    eventName: 'AuthenticationSucceeded',
                    isFailure: false,
                    modified:sinon.match.date
                }
            }));

        });
    });

});

