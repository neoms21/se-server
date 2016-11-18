var assert = require('assert');
var verifier = require('./registerUserVerifier');

describe('register user verifier', function() {

    it('should check response is array', function() {
        var resp = verifier(null);

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

});
