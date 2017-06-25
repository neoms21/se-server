'use strict';
const CommandMediator = require('./command-mediator');
const assert = require('assert');
const sinon = require('sinon');
const Filehound = require('filehound');
const mongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs/Rx');
const eventFactory = require('./event-factory');
const eventMediator = require('./event-mediator');
const mockHandler = require('./mocks/mock-handlerCommandHandler');

let logStub = {
    info: () => {
    },
    error: () => {
    },
    debug: () => {
    }
};
let fhStub = {
    ext: () => {
    },
    paths: () => {
    },
    match: () => {
    },
    find: () => {
    },
    not: () => {
    }
};

let createEvent = function (command, message, eventName = 'CommandVerificationFailedEvent') {
    return {
        eventName: eventName,
        correlationId: command.correlationId,
        messageNumber: 1,
        messageCount: 1,
        messages: message,
        created: new Date(),
        createdBy: undefined,
        isFailure: true
    };
};

describe('Command mediator', function () {
    let logMock;
    let fhMock;
    let createStub;
    let mongoMock;
    let cqrsEventMock;
    let eventMock;

    beforeEach(function () {
        logMock = sinon.mock(logStub);
        createStub = sinon.stub(Filehound, 'create').returns(fhStub);
        fhMock = sinon.mock(fhStub);
        fhMock.expects('ext').withArgs('js').returns(fhStub);
        fhMock.expects('paths').withArgs(process.cwd() + '/src/commands').returns(fhStub);
        fhMock.expects('match').withArgs('*-tests*').returns(fhStub);
        fhMock.expects('not').returns(fhStub);

        mongoMock = sinon.mock(mongoRepository);
        cqrsEventMock = sinon.mock(eventFactory);
        eventMock = sinon.mock(eventMediator);
    });

    afterEach(function () {
        fhMock.verify();
        logMock.verify();
        mongoMock.verify();
        cqrsEventMock.verify();
        eventMock.verify();

        fhMock.restore();
        createStub.restore();
        logMock.restore();
        mongoMock.restore();
        cqrsEventMock.restore();
        eventMock.restore();
    });

    describe('init', function () {
        it('should call find on filehound with error', function () {
            fhMock.expects('find').yields('cant find');
            CommandMediator.init(logStub);
        });

        it('should call find on filehound with successful 1 file ', function () {
            fhMock.expects('find').yields(null, ['./mocks/mock-handlerCommandHandler.js']);
            CommandMediator.init(logStub);
        });

        it('should call find on filehound with successful 3 files', function () {
            fhMock.expects('find').yields(null, ['./mocks/mock-handlerCommandHandler.js',
                './mocks/mock-handlerCommandHandler.js', './mocks/mock-handlerCommandHandler.js']);
            CommandMediator.init(logStub);
        });
    });

    describe('saveCommand', function () {
        let command = {commandName: 'file'};

        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['./mocks/mock-handlerCommandHandler.js',
                './mocks/mock-handlerCommandHandler.js', './mocks/mock-handlerCommandHandler.js']);

            CommandMediator.init(logStub);
        });

        afterEach(function () {
        });

        it('should call insert on repository with success result', function () {
            let event = {id: 1};
            // give success response to insert on repository
            mongoMock.expects('insert').returns(Rx.Observable.of(1));
            cqrsEventMock.expects('CommandSaved').withArgs(command).returns(event);
            eventMock.expects('dispatch').withArgs(event);

            CommandMediator.saveCommand(command);
        });

        it('should call insert on repository with error result', function () {
            let event = {id: 1};
            // give success response to insert on repository
            mongoMock.expects('insert').returns(Rx.Observable.throw(new Error()));
            cqrsEventMock.expects('SaveCommandError').withArgs(command).returns(event);
            eventMock.expects('dispatch').withArgs(event);

            CommandMediator.saveCommand(command);
        });
    });

    describe('createCommand', function () {

        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['./mocks/mock-handlerCommandHandler.js',
                './mocks/mock-handlerCommandHandler.js', './mocks/mock-handlerCommandHandler.js']);

            CommandMediator.init(logStub);
        });

        afterEach(function () {
            //fhMock.verify();
        });

        it('should create the command with supplied info', function () {
            let request = {properties: {commandName: 'SaveUser'}, payload: {id: 1, name: 'john'}};
            let command = CommandMediator.createCommand(request);

            assert.notEqual(command, null);
            assert.notEqual(command, undefined);
            assert.equal(command.properties.commandName, 'SaveUser');
            assert.equal(command.id, 1);
            assert.equal(command.name, 'john');
        });

        it('should create the command with supplied info, but no payload', function () {
            let request = {properties: {commandName: 'SaveUser'}};
            let command = CommandMediator.createCommand(request);

            assert.notEqual(command, null);
            assert.notEqual(command, undefined);
            assert.equal(command.properties.commandName, 'SaveUser');
            assert.equal(command.id, undefined);
            assert.equal(command.name, undefined);
        });

        it('shouldnt create the command without supplied command name', function () {
            let request = {commandNameXXX: 'SaveUser'};
            let command = CommandMediator.createCommand(request);

            assert.equal(command, undefined);
        });
    });

    describe('dispatch', function () {
        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['./mocks/mock-handlerCommandHandler.js',
                './mocks/mock-handlerCommandHandler.js', './mocks/mock-handlerCommandHandler.js']);
            CommandMediator.init(logStub);
        });

        afterEach(function () {
            fhMock.verify();
        });

        it('should give error when command doesnt match', function () {
            let command = {properties: {commandName: 'hhhh', correlationId: 2}};
            //let event = createErrorEvent(command, 'Unable to create handler for command hhhh');

            eventMock.expects('dispatch').once(); //.withArgs(event);
            logMock.expects('error').withArgs('Unable to create handler for command hhhh');

            CommandMediator.dispatch(command);
        });

        it('should produce error event if verify fails', function () {
            let verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.throw('Error'));

            let command = {properties: {commandName: 'mock-handler', correlationId: 2}};
            //logMock.expects('debug').withArgs('CommandMediator before running verify for mock-handler');
            let event = createEvent(command, 'Error');
            cqrsEventMock.expects('CommandVerificationFailed').withArgs(command).returns(event);
            eventMock.expects('dispatch').once(); //withArgs(event);

            // act
            CommandMediator.dispatch(command);

            //tidy
            verifyStub.restore();
        });

        it('should produce error event if verify has error messages', function () {
            let verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.of('#Error'));

            let command = {properties: {commandName: 'mock-handler', correlationId: 3}};
            //logMock.expects('debug').withArgs('CommandMediator before running verify for mock-handler');
            let event = createEvent(command, 'Error');
            cqrsEventMock.expects('CommandVerificationFailed').withArgs(command).returns(event);
            eventMock.expects('dispatch').withArgs(event);

            // act
            CommandMediator.dispatch(command);

            //tidy
            verifyStub.restore();
        });


        it('should execute, save and propagate if no problems found', function () {
            let verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.empty());
            let executeStub = sinon.stub(mockHandler, 'execute');
            let command = {properties: {commandName: 'DummyCommand', correlationId: 3}};
            //eventMock.expects('dispatch').withArgs(event);

            // act
            CommandMediator.dispatch(command);

            // check
            assert(verifyStub.called);
            assert(executeStub.called);

            //tidy
            verifyStub.restore();
            executeStub.restore();
        });
    });

});


