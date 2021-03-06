const sinon = require('sinon');
const assert = require('assert');
const mongoRepository = require('../../db/mongo-repository');
const handler = require('./create-match-command');
const Rx = require('rxjs/Rx');
const eventMediator = require('../../cqrs/event-mediator');
const generalServices = require('../../cqrs/general-services');

describe('Create match command', function () {
  let countStub;
  let queryStub;
  let count = 0;
  let timeStub;
  let commonStub;

  beforeEach(function () {
    countStub = sinon.stub(mongoRepository, 'getCount').callsFake(() => {
      // supply dummy observable
      return Rx.Observable.from([count]);
    });
    queryStub = sinon.stub(mongoRepository, 'query').callsFake(() => {
      // supply dummy observable
      return Rx.Observable.from([count]);
    });
    timeStub = sinon.stub(generalServices, 'getTime').callsFake(() => new Date('01 Sep 2016 08:00'));
    commonStub = sinon.stub(generalServices, 'applyCommonFields').callsFake(() => {
    });
  });

  afterEach(function () {
    countStub.restore();
    queryStub.restore();
    timeStub.restore();
    commonStub.restore();
  });

  describe('Verify', function () {
    it('should check response is array', function (done) {
      handler.command = {payload: {}};
      handler.verify().toArray()
        .subscribe(function (success) {
          assert(typeof success, 'array');
        }, function (err) {
          assert(err, null);
        }, function () {
          done();
        });
    });

    it('should check squad, matchdate and opposition name are defined', function (done) {
      handler.command = {payload: {}};
      handler.verify().toArray()
        .subscribe(function (resp) {
          assert.equal(resp.length, 4);
          assert.deepEqual(resp[0], {squad: 'Squad property was not defined'});
          assert.deepEqual(resp[1], {matchDate: 'MatchDate property was not defined'});
          assert.deepEqual(resp[2], {opposition: 'Opposition property was not defined'});
          assert.deepEqual(resp[3], 'There is no squad for id undefined');
        }, function (err) {
          assert(err, null);
        }, function () {
          done();
        });
    });

    it('should check matchdate and opposition not defined when squad is defined', function (done) {
      handler.command = {payload: {squad: 1}};
      handler.verify().toArray()
        .subscribe(function (resp) {
          assert.equal(resp.length, 3);
          assert.deepEqual(resp[0], {matchDate: 'MatchDate property was not defined'});
          assert.deepEqual(resp[1], {opposition: 'Opposition property was not defined'});
        }, function (err) {
          assert(err, null);
        }, function () {
          done();
        });
    });

    it('should check squad, opposition not defined when matchdate is defined', function (done) {
      handler.command = {payload: {matchDate: new Date()}};
      handler.verify().toArray()
        .subscribe(function (resp) {
          assert.equal(resp.length, 3);
          assert.deepEqual(resp[0], {squad: 'Squad property was not defined'});
          assert.deepEqual(resp[1], {opposition: 'Opposition property was not defined'});
        }, function (err) {
          assert(err, null);
        }, function () {
          done();
        });
    });

    it('should check squad, matchDate not defined when opposition is defined', function (done) {
      handler.command = {payload: {opposition: 'Corinthian casuals'}};
      handler.verify().toArray()
        .subscribe(function (resp) {
          assert.equal(resp.length, 3);
          assert.deepEqual(resp[0], {squad: 'Squad property was not defined'});
          assert.deepEqual(resp[1], {matchDate: 'MatchDate property was not defined'});
        }, function (err) {
          assert(err, null);
        }, function () {
          done();
        });
    });

  });

  describe('Execute', function () {
    let loggerStub;
    let dispatchStub;

    beforeEach(function () {
      loggerStub = {
        info: function () {
        }
      };
      eventMediator.init(loggerStub);
    });

    afterEach(function () {
      dispatchStub.restore();
    });

    it('should raise CreateMatchEvent', function () {
      dispatchStub = sinon.stub(eventMediator, 'dispatch').callsFake(() => {
      });

      handler.command = {
        payload: {
          squad: 1,
          matchDate: Date.parse('01-01-2017'),
          opposition: 'Esher Lions',
        },
        properties: {
          correlationId: 1,
          clientId: 200,
          commandName: 'CreateMatchCommand'
        }
      };
      handler.execute();

      assert(dispatchStub.called);
      console.log('@@@@@@@ ', dispatchStub.args[0])
      assert(dispatchStub.calledWith(sinon.match({
        properties: {
          eventName: 'CreateMatchEvent',
          isFailure: false
        },
        command: {
          payload: {
            squad: 1,
            matchDate: Date.parse('01-01-2017'),
            opposition: 'Esher Lions',
          },
          properties: {
            correlationId: 1,
            clientId: 200,
            commandName: 'CreateMatchCommand'
          }
        },
        payload: {
          matchDate: Date.parse('01-01-2017'),
          opposition: 'Esher Lions',
        }
      })));

    });

  });
});
