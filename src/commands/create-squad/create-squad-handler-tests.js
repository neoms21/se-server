const sinon = require('sinon');
const assert = require('assert');
const mongoRepository = require('../../db/mongo-repository');
const handler = require('./CreateSquadCommandHandler');
const Rx = require('rxjs/Rx');

describe('Create Squad command', function () {
  let countStub;

  beforeEach(function () {

  });

  afterEach(function () {
    countStub.restore();
  });

  describe('Verify', function () {
    it('should check response is array and error message is returned if squadname is empty',
      function (done) {

        handler.command = {payload: {}};
        countStub = sinon.stub(mongoRepository, 'getCount').callsFake(() => {
          // supply dummy observable
          return Rx.Observable.from([1]);
        });
        handler.verify().toArray()
          .subscribe(function (errors) {
            assert.equal(errors instanceof Array, true);
            assert.deepEqual(errors[0], {squadName: 'Squad name is mandatory'});

          }, function (err) {
            assert(err, null);
          }, function () {
            done();
          });
      });

    it('should check response is array and error message is returned if squadname exists',
      function (done) {
        countStub = sinon.stub(mongoRepository, 'getCount').callsFake(() => {
          // supply dummy observable
          return Rx.Observable.from([1]);
        });
        handler.command = {payload: {squadName: 'abc'}};

        handler.verify().toArray()
          .subscribe(function (errors) {
            assert.equal(errors instanceof Array, true);
            assert.deepEqual(errors[0], {squadName: 'Squad name abc already exists!!'});

          }, function (err) {
            assert(err, null);
          }, function () {
            done();
          });
      });

  });

});
