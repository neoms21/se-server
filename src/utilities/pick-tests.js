const pick = require('./pick');
const assert = require('assert');

describe('Pick', function () {

    beforeEach(function () {

    });

    afterEach(function () {


    });

    describe('Verify', function () {
        it('pick specified properties from object',
            function () {
                assert(pick({a: "first", b: 'second'}, ['a']), {'a': 'first'});
            });
    });

});

