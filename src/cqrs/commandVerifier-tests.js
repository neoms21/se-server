var assert = require('assert');
var verifier = require('./commandVerifier');

describe('command verifier', function() {

    it('should check response is array', function() {
        var resp = verifier.verify(null);

        assert(typeof resp, 'array');
    });

    it('should check command is null', function() {
        var resp = verifier.verify(null);

        assert.equal(resp.length, 1);
        assert.equal(resp[0], 'command was not defined');
    });

    it('should check command is undefined', function() {
        var resp = verifier.verify(undefined);

        assert.equal(resp.length, 1);
        assert.equal(resp[0], 'command was not defined');
    });

});
