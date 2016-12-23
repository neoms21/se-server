const sinon = require('sinon');
const assert = require('assert');
const dbUtil = require('../../db/repository');

describe('Register user command', function () {
    let countStub: any;
    let insertStub: any;
    let count = 0;

    beforeEach(function () {
        insertStub = sinon.stub(dbUtil, 'insert', () => {
        });
    });

    afterEach(() => {
        insertStub.restore();

    });

    it('should check response is array', function() {
        var resp = verifier({});

        assert(typeof resp, 'array');
    });

    it('should check name, userName and password is defined', function() {
        var resp = verifier({ });

        assert.equal(resp.length, 3);
        assert.equal(resp[0], 'registerUser command name property was not defined');
        assert.equal(resp[1], 'registerUser command userName property was not defined');
        assert.equal(resp[2], 'registerUser command password property was not defined');
    });

    it('should check name, userName not defined when password is defined', function() {
        var resp = verifier({ password: 'ghghghgh' });

        assert.equal(resp.length, 2);
        assert.equal(resp[0], 'registerUser command name property was not defined');
        assert.equal(resp[1], 'registerUser command userName property was not defined');
    });

    it('should check password, userName not defined when name is defined', function() {
        var resp = verifier({ name: 'ghghghgh' });

        assert.equal(resp.length, 2);
        assert.equal(resp[0], 'registerUser command userName property was not defined');
        assert.equal(resp[1], 'registerUser command password property was not defined');
    });

    it('should check password, name not defined when username is defined', function() {
        var resp = verifier({ userName: 'ghg' });

        assert.equal(resp.length, 2);
        assert.equal(resp[0], 'registerUser command name property was not defined');
        assert.equal(resp[1], 'registerUser command password property was not defined');
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
