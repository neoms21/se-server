'use strict';
const socketHandler = require('./socket-handler');
const assert = require('assert');
const sinon = require('sinon');
const Rx = require('rxjs/Rx');
const jwt = require('jsonwebtoken');
const EventMediator = require('./../cqrs/event-mediator');
const EventFactory = require('./../cqrs/event-factory');
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
            timeStub = sinon.stub(GeneralServices, 'getTime', () => tod);

            // set up common stuff
            io = new EventEmitter();
            socket = new EventEmitter();
            socket.id = '123@';
            socketHandler(io, logger);
        });

        afterEach(() => {
            loggerErrorSpy.restore();
            loggerInfoSpy.restore();
            eventMediatorStub.restore();
            timeStub.restore();
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
            let jwtStub = sinon.stub(jwt, 'verify').yields('blah'); // send error back
            io.emit('connection', socket);
            socket.emit('authentication', {token: '@@@@@'});
            socket.emit('disconnect'); // deletes the client

            assert(eventMediatorStub.called);
            assert(eventMediatorStub.calledWith(
                {
                    command: {correlationId: '', name: 'Unknown'},
                    properties: {
                        eventName: 'AuthenticationFailed',
                        isFailure: true,
                        created: tod,
                        createdBy: undefined,
                        validFrom: tod,
                        validTo: new Date('9999-12-31'),
                        messageNumber: 1,
                        messageCount: 1,
                    },
                    error: 'Authentication token didnt match for socket 123@'
                }));

            jwtStub.restore();
        });

        it('should give error if socket wrong', () => {
            let jwtStub = sinon.stub(jwt, 'verify').yields(null); // verifies ok
            io.emit('connection', socket);
            socket.emit('disconnect'); // deletes the client
            socket.emit('authentication', {token: '@@@@@'});
            jwtStub.restore();

            assert(eventMediatorStub.called);
            assert(eventMediatorStub.calledWith({
                properties: {
                    eventName: 'AuthenticationFailed',
                    isFailure: true,
                    created: tod,
                    createdBy: 'unknown',
                    validFrom: tod,
                    validTo: new Date('9999-12-31'),
                    messageNumber: 1,
                    messageCount: 1,
                },
                error: 'Failed to find matching socket 123@'
            }));
        });

        it('should give success if authentication match', () => {
            let jwtStub = sinon.stub(jwt, 'verify').yields(null); // verifies ok
            io.emit('connection', socket);
            socket.emit('authentication', {token: '@@@@@'});
            socket.emit('disconnect'); // deletes the client
            jwtStub.restore();

            assert(eventMediatorStub.called);
            console.log(eventMediatorStub.getCall(0).args)
            assert(eventMediatorStub.calledWith({
                properties: {
                    eventName: 'AuthenticationSucceeded',
                    isFailure: false,
                    created: tod,
                    createdBy: 'unknown',
                    validFrom: tod,
                    validTo: new Date('9999-12-31'),
                    messageNumber: 1,
                    messageCount: 1
                }
            }));

        });
    });

});

