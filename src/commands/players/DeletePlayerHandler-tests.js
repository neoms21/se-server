const sinon = require('sinon');
const assert = require('assert');
const mongoRepository = require('../../db/mongo-repository');
const handler = require('./DeletePlayerHandler');
const Rx = require('rxjs/Rx');

describe('Delete Player command', function () {
    let countStub;

    beforeEach(function () {

    });

    afterEach(function () {
        countStub.restore();
    });

    describe('Verify', function () {
        it('should check response is array and error message is returned if player id is empty',
            function (done) {

                handler.command = {payload: {player: {}}};
                countStub = sinon.stub(mongoRepository, 'query', function () {
                    // supply dummy observable
                    return Rx.Observable.from([1]);
                });
                handler.verify().toArray()
                    .subscribe(function (errors) {
                        assert.equal(errors instanceof Array, true);
                        assert.deepEqual(errors[0], {
                            squadName: 'Unable to delete, ' +
                            'missing squad id'
                        });

                    }, function (err) {
                        assert(err, null);
                    }, function () {
                        done();
                    });
            });

        it('should check response is array and error message is returned if player not existing',
            function (done) {
                countStub = sinon.stub(mongoRepository, 'query', function () {
                    // supply dummy observable
                    return Rx.Observable.of(undefined);
                });
                handler.command = {payload: {player: {id: '', squadId: 's'}}};

                handler.verify().toArray()
                    .subscribe(function (errors) {
                        assert.equal(errors instanceof Array, true);
                        assert.deepEqual(errors[0], {playerName: 'Player doesn\'t exist!!'});

                    }, function (err) {
                        assert(err, null);
                    }, function () {
                        done();
                    });
            });

    });

});
