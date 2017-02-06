'use strict';
const socketHandler = require('./socket-handler');
const assert = require('assert');
const sinon = require('sinon');
const Rx = require('rxjs/Rx');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');
const EventEmitter = require('events');



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
        let mongoRepoStub;
        let loggerErrorSpy;
        let loggerInfoSpy;

        beforeEach(() => {
            logger = sinon.stub();
            logger.info = Function;
            logger.error = Function;

            loggerErrorSpy = sinon.spy(logger, 'error');
            loggerInfoSpy = sinon.spy(logger, 'info');
            io = new EventEmitter();
            socket = new EventEmitter();
            socket.id = '123@';
            socketHandler(io, logger);
        });

        afterEach(() => {
            loggerErrorSpy.restore();
            loggerInfoSpy.restore();
        });

        it('should log when connected', () => {
            io.emit('connection', socket);

            setTimeout(() => {
                assert(loggerInfoSpy.calledWith('a user connected on socket ' + socket.id));
            }, 300);
        });

        // it('should subscribe to events', () => {
        //     let onSpy = sinon.spy(socket, 'on');
        //     io.emit('connection', socket);
        //
        //     setTimeout(() => {
        //         assert(onSpy.calledWith('xxx'));
        //         assert(onSpy.secondCall.calledWith('authentication'));
        //         assert(onSpy.thirdCall.calledWith('authentication'));
        //         onSpy.restore();
        //     }, 300);
        //
        // });


    });

});

