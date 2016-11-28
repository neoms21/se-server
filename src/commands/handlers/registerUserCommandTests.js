const assert = require('assert');
const command = require('./registerUserCommand');
const sinon = require('sinon');
const dbUtil = require('../../db/dbUtil');
const Rx = require('rx');

describe('Register user command', function () {
    let countStub;
    let insertStub;
    let count = 0;

    beforeEach(function () {
        insertStub = sinon.stub(dbUtil, 'insert', () => {
        });
    });

    afterEach(() => {
        insertStub.restore();

    });

    it('should allow add for non matching login', function () {
        countStub = sinon.stub(dbUtil, 'getCount', () => {
            // supply dummy observable
            return Rx.Observable.from([count]);
        });

        command.apply({userName: 'mark', name: 'mark s'});

        assert(insertStub.called);
        countStub.restore();
    });

    it('should reject when login exists', function (done) {
        countStub = sinon.stub(dbUtil, 'getCount', () => {
            // supply dummy observable
            return Rx.Observable.from([1]);
        });

        command.apply({userName: 'mark', name: 'mark s'})
            .subscribe(succ => {
                assert.fail('Should produce error');
                done();
            }, err => {
                assert.equal(err, 'The username mark is a duplicate');
                done();
            });

        countStub.restore();
    });
});
