'use strict';
var CommandMediator = require('./command-mediator');
var assert = require('assert');
var sinon = require('sinon');
var Filehound = require('filehound');
var mongoRepository = require('../db/mongo-repository');
var Rx = require('rxjs/Rx');
var cqrsEventCreator = require('./cqrs-event-creator');
var eventMediator = require('./event-mediator');
var mockHandler = require('./mock-handlerCommandHandler');

var logStub = {
    info: function () {
    },
    error: function () {
    }
};
var fhStub = {
    ext: function () {
    },
    paths: function () {
    },
    match: function () {
    },
    find: function () {
    }
};

var createErrorEvent = function (command, message) {
    return {
        eventName: 'CommandVerificationFailedEvent',
        correlationId: command.correlationId,
        messageNumber: 1,
        messageCount: 1,
        messages: [message],
        created: new Date(),
        createdBy: undefined,
        isFailure: true
    };
};

describe('Command mediator', function () {
    var logMock;
    var fhMock;
    var createStub;
    var mongoMock;
    var cqrsEventMock;
    var eventMock;

    beforeEach(function () {
        logMock = sinon.mock(logStub);
        createStub = sinon.stub(Filehound, 'create').returns(fhStub);
        fhMock = sinon.mock(fhStub);
        fhMock.expects('ext').withArgs('js').returns(fhStub);
        fhMock.expects('paths').withArgs(process.cwd() + '/src/commands').returns(fhStub);
        fhMock.expects('match').withArgs('*CommandHandler*').returns(fhStub);
        mongoMock = sinon.mock(mongoRepository);
        cqrsEventMock = sinon.mock(cqrsEventCreator);
        eventMock = sinon.mock(eventMediator);
    });

    afterEach(function () {
        fhMock.restore();
        createStub.restore();
        logMock.restore();
        mongoMock.restore();
        cqrsEventMock.restore();
        fhMock.restore();
        eventMock.restore();

        fhMock.verify();
        logMock.verify();
        mongoMock.verify();
        cqrsEventMock.verify();
        fhMock.verify();
        eventMock.verify();

    });

    describe('init', function () {
        it('should call find on filehound with error', function () {
            fhMock.expects('find').yields('cant find');
            CommandMediator.init(logStub);
        });

        it('should call find on filehound with successful 1 file ', function () {
            fhMock.expects('find').yields(null, ['file.js']);
            CommandMediator.init(logStub);
        });

        it('should call find on filehound with successful 3 files', function () {
            fhMock.expects('find').yields(null, ['file.js', 'second.js', 'third.js']);
            CommandMediator.init(logStub);
        });
    });

    describe('saveCommand', function () {
        var command = {commandName: 'file'};

        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['file.js', 'second.js', 'third.js']);

            CommandMediator.init(logStub);
        });

        afterEach(function () {
            //fhMock.verify();
        });

        it('should call insert on repository with success result', function () {
            var event = {id: 1};
            // give success response to insert on repository
            mongoMock.expects('insert').returns(Rx.Observable.of(1));
            cqrsEventMock.expects('CommandSaved').withArgs(command).returns(event);
            eventMock.expects('dispatch').withArgs(event);

            CommandMediator.saveCommand(command);
        });

        it('should call insert on repository with error result', function () {
            var event = {id: 1};
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
            fhMock.expects('find').yields(null, ['file.js', 'second.js', 'third.js']);

            CommandMediator.init(logStub);
        });

        afterEach(function () {
            //fhMock.verify();
        });

        it('should create the command with supplied info', function () {
            var request = {commandName: 'SaveUser', payload: {id: 1, name: 'john'}};
            var command = CommandMediator.createCommand(request);

            assert.notEqual(command, null);
            assert.notEqual(command, undefined);
            assert.equal(command.commandName, 'SaveUser');
            assert.equal(command.id, 1);
            assert.equal(command.name, 'john');
        });

        it('should create the command with supplied info, but no payload', function () {
            var request = {commandName: 'SaveUser'};
            var command = CommandMediator.createCommand(request);

            assert.notEqual(command, null);
            assert.notEqual(command, undefined);
            assert.equal(command.commandName, 'SaveUser');
            assert.equal(command.id, undefined);
            assert.equal(command.name, undefined);
        });

        it('shouldnt create the command without supplied command name', function () {
            var request = {commandNameXXX: 'SaveUser'};
            var command = CommandMediator.createCommand(request);

            assert.equal(command, undefined);
        });
    });

    describe('dispatch', function () {
        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, [process.cwd() + '/src/cqrs/mock-handlerCommandHandler.js', 'second.js', 'third.js']);
            CommandMediator.init(logStub);
        });

        afterEach(function () {
            //fhMock.verify();
        });

        it('should give error when command doesnt match', function () {
            var command = {commandName: 'hhhh', correlationId: 2};
            var event = createErrorEvent(command, 'Unable to create handler for command hhhh');

            eventMock.expects('dispatch').once(); //.withArgs(event);
            logMock.expects('error').withArgs('Unable to create handler for command hhhh');

            CommandMediator.dispatch(command);
        });

        it('should produce error event if verify fails', function () {
            var verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.throw('Error'));

            var command = {commandName: 'mock-handler', correlationId: 2};
            //logMock.expects('debug').withArgs('CommandMediator before running verify for mock-handler');
            var event = createErrorEvent(command, 'Error');
            cqrsEventMock.expects('CommandVerificationFailed').withArgs(command).returns(event);
            eventMock.expects('dispatch').once(); //withArgs(event);

            // act
            CommandMediator.dispatch(command);

            //tidy
            verifyStub.restore();
        });

        it('should produce error event if verify has error messages', function () {
            var verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.of(['#Error']));

            var command = {commandName: 'mock-handler', correlationId: 3};
            //logMock.expects('debug').withArgs('CommandMediator before running verify for mock-handler');
            var event = createErrorEvent(command, 'Error');
            cqrsEventMock.expects('CommandVerificationFailed').withArgs(command).returns(event);
            eventMock.expects('dispatch').withArgs(event);

            // act
            CommandMediator.dispatch(command);

            //tidy
            verifyStub.restore();
        });

        it('should execute, save and propagate if no problems found', function () {
            var verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.of());
            var executeStub = sinon.stub(mockHandler, 'execute');
            var saveStub = sinon.stub(CommandMediator, 'saveCommand');
            var command = {commandName: 'mock-handler', correlationId: 3};
            //var event = createErrorEvent(command, 'Error');
            //cqrsEventMock.expects('CommandVerificationFailed').withArgs(command).returns(event);
            //eventMock.expects('dispatch').once(); //.withArgs(event);

            //logMock.expects('debug').withArgs('CommandMediator before running verify for mock-handler');

            // act
            CommandMediator.dispatch(command);

            // check
            assert(verifyStub.called);
            assert(executeStub.called);
            assert(saveStub.called);

            //tidy
            verifyStub.restore();
        });
    });

});


