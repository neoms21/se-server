const sinon = require('sinon');
const mongoRepository = require('../db/mongo-repository');
const deNormalizer = require('./players-denormalizer');
const Rx = require('rxjs/Rx');
const eventMediator = require('../cqrs/event-mediator');
const GeneralServices = require('../cqrs/general-services');
const Guid = require('uuid');
const assert = require('assert');

describe('Players denormalizer Tests', function () {
  let loggerStub;
  let dispatchStub, guidStub;

  beforeEach(function () {

    loggerStub = {
      info: sinon.stub()
    };
    eventMediator.init(loggerStub);
    dispatchStub = sinon.stub(eventMediator, 'dispatch').callsFake(() => {
    });
    guidStub = sinon.stub(Guid, 'v4').returns('abc223');
  });

  afterEach(function () {
    dispatchStub.restore();
    guidStub.restore();
  });

  describe('player creation', function () {

    it('create the user with id', function (done) {

      const updateStub = sinon.stub(mongoRepository, 'update').callsFake((collectionName, key, updates) => {
        assert(updates.players[2].id === 'abc223');
        assert(updates.properties === undefined);
        console.log('###### ', updates.players[2])
        assert.notEqual(updates.players[2].properties, undefined);

        updateStub.restore();
        queryStub.restore();
        done();
      });

      const queryStub = sinon.stub(mongoRepository, 'query').callsFake(() => {
        // supply dummy observable
        return Rx.Observable.of({
          _id: '507f1f77bcf86cd799439011',
          squadName: 's1',
          players: [
            {
              playerName: 'MS',
              email: 'neo@gma.com',
              id: '1234'
            },
            {
              playerName: 'MS1',
              email: 'neo@gddma.com'
            }]
        });
      });

      deNormalizer.handleMessage({
        command: {
          payload: {
            player: {squadId: '507f1f77bcf86cd799439011'}
          }
        },
        properties: {
          eventName: 'CreatePlayerEvent'
        }
      });
      assert(queryStub.called);
      assert(updateStub.called);

    });
  });

  describe('player edit', function () {

    it('create replace the user if id exists', function (done) {

      const updateStub = sinon.stub(mongoRepository, 'update').callsFake((r, x, y) => {
        assert(y.players[1].email === 'asjk@sde.com');
        done();
      });

      const queryStub = sinon.stub(mongoRepository, 'query').callsFake(() => {
        // supply dummy observable
        return Rx.Observable.of({
          _id: '507f1f77bcf86cd799439011',
          squadName: 's1',
          players: [
            {
              squadId: '507f1f77bcf86cd799439011',
              playerName: "existing",
              id: 'abc223',
              email: 'xxxx'
            },
            {
              playerName: 'MS1',
              email: 'neo@gddma.com'
            }]
        });
      });

      deNormalizer.handleMessage({
        command: {
          payload: {
            player: {
              squadId: '507f1f77bcf86cd799439011',
              id: 'abc223',
              email: 'asjk@sde.com'
            }
          }
        },
        properties: {
          eventName: 'CreatePlayerEvent'
        }
      });
      assert(queryStub.called);
      assert(updateStub.called);

      updateStub.restore();
      queryStub.restore();
    });


  });

  describe('player delete', function () {

    it('mark the player as deleted if delete event', function (done) {

      const updateStub = sinon.stub(mongoRepository, 'update', function (r, x, y) {
        assert(y.players[1].isDeleted === true);

        done();
      });

      const queryStub = sinon.stub(mongoRepository, 'query', function () {
        // supply dummy observable
        return Rx.Observable.of({
          _id: '507f1f77bcf86cd799439011',
          squadName: 's1',
          players: [
            {
              squadId: '507f1f77bcf86cd799439011',
              playerName: "existing",
              id: 'abc223',
              email: 'xxxx'
            },
            {
              playerName: 'MS1',
              email: 'neo@gddma.com'
            }]
        });
      });

      deNormalizer.handleMessage({
        command: {
          payload: {
            player: {
              squadId: '507f1f77bcf86cd799439011',
              id: 'abc223',
              email: 'asjk@sde.com'
            }
          }
        },
        properties: {
          eventName: 'DeletePlayerEvent'
        }
      });
      assert(queryStub.called);
      assert(updateStub.called);

      updateStub.restore();
      queryStub.restore();
    });
  });
});
