'use strict';
var DenormalizerMediator = require('./denormalizer-mediator');
var assert = require('assert');
var sinon = require('sinon');
var Filehound = require('filehound');
var mongoRepository = require('../db/mongo-repository');
var Rx = require('rxjs/Rx');
var cqrsEventCreator = require('./cqrs-event-creator');
var eventMediator = require('./event-mediator');
var mockHandler = require('./mocks/mock-handlerCommandHandler');

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

describe('Denormalizer mediator', function () {
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
        fhMock.expects('paths').withArgs(process.cwd() + '/src/denormalizers').returns(fhStub);
        fhMock.expects('match').withArgs('!(*-test*)*').returns(fhStub);
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
        beforeEach(function() {
            //eventMock.expects('propagator.subscribe');
        });

        it('should call find on filehound with error', function () {
            fhMock.expects('find').yields('cant find');
            DenormalizerMediator.init(logStub);
        });

        it('should call find on filehound with successful 1 file ', function () {
            fhMock.expects('find').yields(null, [process.cwd() + '/src/cqrs/mocks/mock-denormalizer.js']);
            DenormalizerMediator.init(logStub);
        });

        it('should call find on filehound with successful 3 files', function () {
            var filename = process.cwd() + '/src/cqrs/mocks/mock-denormalizer.js';
            fhMock.expects('find').yields(null, [filename, filename, filename]);
            DenormalizerMediator.init(logStub);
        });
    });

});


