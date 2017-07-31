'use strict';
const DenormalizerMediator = require('./denormalizer-mediator');
const assert = require('assert');
const sinon = require('sinon');
const Filehound = require('filehound');
const mongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs/Rx');
const eventFactory = require('./event-factory');
const eventMediator = require('./event-mediator');
const mockHandler = require('./mocks/mock-handlerCommandHandler');

let logStub = {
  info: function() {},
  error: function() {}
};
let fhStub = {
  ext: function() {},
  paths: function() {},
  match: function() {},
  find: function() {},
  not: () => {}
};

let createErrorEvent = function(command, message) {
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

describe('Denormalizer mediator', function() {
  let logMock;
  let fhMock;
  let createStub;
  let mongoMock;
  let cqrsEventMock;
  let eventMock;

  beforeEach(function() {
    logMock = sinon.mock(logStub);
    createStub = sinon.stub(Filehound, 'create').returns(fhStub);
    fhMock = sinon.mock(fhStub);
    fhMock.expects('ext').withArgs('js').returns(fhStub);
    fhMock.expects('paths').withArgs(process.cwd() + '/src/denormalizers').returns(fhStub);
    fhMock.expects('match').withArgs('*-tests*').returns(fhStub);
    fhMock.expects('not').returns(fhStub);
    mongoMock = sinon.mock(mongoRepository);
    cqrsEventMock = sinon.mock(eventFactory);
    eventMock = sinon.mock(eventMediator);
  });

  afterEach(function() {
    fhMock.verify();
    logMock.verify();
    mongoMock.verify();
    cqrsEventMock.verify();
    fhMock.verify();
    eventMock.verify();

    fhMock.restore();
    createStub.restore();
    logMock.restore();
    mongoMock.restore();
    cqrsEventMock.restore();
    fhMock.restore();
    eventMock.restore();
  });

  describe('init', function() {
    beforeEach(function() {
      //eventMock.expects('propagator.subscribe');
    });

    it('should call find on filehound with error', function() {
      fhMock.expects('find').yields('cant find');
      DenormalizerMediator.init(logStub);
    });

    it('should call find on filehound with successful 1 file ', function() {
      fhMock.expects('find').yields(null, [process.cwd() + '/src/cqrs/mocks/mock-denormalizer.js']);
      DenormalizerMediator.init(logStub);
    });

    it('should call find on filehound with successful 3 files', function() {
      let filename = process.cwd() + '/src/cqrs/mocks/mock-denormalizer.js';
      fhMock.expects('find').yields(null, [filename, filename, filename]);
      DenormalizerMediator.init(logStub);
    });
  });

});
