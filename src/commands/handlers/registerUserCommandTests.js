const assert = require('assert');
const verifier = require('./commandVerifier');

describe('Register user command', function() {

    it('should check response is array', function() {
        let resp = verifier(null);

        assert(typeof resp, 'array');
    });

    it('should check command is null', function() {
        var resp = verifier(null);

        assert.equal(resp.length, 1);
        assert.equal(resp[0], 'command was not defined');
    });

    it('should check command is undefined', function() {
        var resp = verifier(undefined);

        assert.equal(resp.length, 1);
        assert.equal(resp[0], 'command was not defined');
    });

});
