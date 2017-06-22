const sinon = require('sinon');
const chai = require('chai');
const mongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs/Rx');
const EventMediator = require('../cqrs/event-mediator');
const GeneralServices = require('../cqrs/general-services');
const deNormalizer = require('./logins-denormalizer');

describe('Login denormalizers', function () {
  let countStub;
  let insertStub;
  let count = 0;
  let timeStub;
  let loggerStub;
  let dispatchStub;

  beforeEach(function () {
    countStub = sinon.stub(mongoRepository, 'getCount').callsFake(() => {
      // supply dummy observable
      return Rx.Observable.from([count]);
    });
    insertStub = sinon.stub(mongoRepository, 'insert');
    timeStub = sinon.stub(GeneralServices, 'getTime').callsFake(() => new Date('01 Sep 2016 08:00'));
    loggerStub = {
      info: sinon.spy(),
      error: sinon.spy()
    };
    dispatchStub = sinon.stub(EventMediator, 'dispatch');
    EventMediator.init(loggerStub);
    deNormalizer.init(loggerStub);
  });

  afterEach(function () {
    countStub.restore();
    timeStub.restore();
    dispatchStub.restore();
    insertStub.restore();
  });

  describe('handleRegisterUser', function () {
    let event = {
      command: { payload: {}}
    };

    it('should give error when event properties not set', function (done) {
      deNormalizer.handleMessage({});
      chai.assert.isTrue(loggerStub.error.called);
      done();
    });

    it('should give error when event properties not set', function (done) {
      deNormalizer.handleMessage(event);
      chai.assert.isTrue(countStub.called);
      done();
    });
  });

  describe('getMessages', function () {

    it('should return correct messages', function () {

      const msgList = deNormalizer.getMessages();
      chai.assert.isArray(msgList, 'Should be array');
      chai.assert.equal(msgList.length, 1);
      chai.assert.equal(msgList[0], 'UserRegisteredEvent');
    });

  });
});
