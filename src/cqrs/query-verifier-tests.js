var assert = require('assert');
var verifier = require('./query-verifier');

describe('Query verifier', function() {

    it('should check response is array', function() {
        var resp = verifier.verify(null);

        assert(typeof resp, 'array');
    });

    it('should check query is null', function() {
        var resp = verifier.verify(null);

        assert.equal(resp.length, 1);
        assert.equal(resp[0], 'query was not defined');
    });

    it('should check query is undefined', function() {
        var resp = verifier.verify(undefined);

        assert.equal(resp.length, 1);
        assert.equal(resp[0], 'query was not defined');
    });

});
