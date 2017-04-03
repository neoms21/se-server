const sinon = require('sinon');
const assert = require('assert');
const mongoRepository = require('../../db/mongo-repository');
const handler = require('./CreateSquadCommandHandler');
const Rx = require('rxjs/Rx');
const eventMediator = require('../../cqrs/event-mediator');
const generalServices = require('../../cqrs/general-services');

describe('Create Squad command', function () {
    let countStub;
    let count = 0;
    let timeStub;

    beforeEach(function () {

    });

    afterEach(function () {
        countStub.restore();
    });

    describe('Verify', function () {
        it('should check response is array and error message is returned if squadname is empty',
            function (done) {

            handler.command = {payload:{}};
                countStub = sinon.stub(mongoRepository, 'getCount', function () {
                    // supply dummy observable
                    return Rx.Observable.from([1]);
                });
            handler.verify().toArray()
                .subscribe(function (errors) {
                    assert.equal(errors instanceof Array, true);
                    assert.deepEqual(errors[0], {squadName:'Squad name is mandatory'});

                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

        it('should check response is array and error message is returned if squadname exists',
            function (done) {
                countStub = sinon.stub(mongoRepository, 'getCount', function () {
                    // supply dummy observable
                    return Rx.Observable.from([1]);
                });
            handler.command = {payload:{squadName:'abc'}};

            handler.verify().toArray()
                .subscribe(function (errors) {
                    assert.equal(errors instanceof Array, true);
                    assert.deepEqual(errors[0], {squadName:'Squad name abc already exists!!'});

                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

    });

});
