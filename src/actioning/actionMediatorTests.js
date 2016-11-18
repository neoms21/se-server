var assert = require('assert');
var actionMediator = require('./actionMediator');
var sinon = require('sinon');
var fs = require('fs');
var registerUserActioner = require('./actioners/registerUserActioner');

describe('Action mediator', function() {
    var fsStub;
    var actionMock;

    beforeEach(function() {
        fsStub = sinon.stub(fs, 'readdir', function(path, callback) {
            callback(null, ['registerUserActioner', 'def']);
        });
        actionMock = sinon.mock(registerUserActioner.action);

    });

    afterEach(function() {
        fs.readdir.restore();
        actionMock.verify();
        actionMock.restore();
    });

    it('should be created', function() {
        assert(actionMediator !== null && actionMediator !== undefined);
    });

    it('should add files in init', function() {

        actionMediator.init();
    });

    it('should dispatch registerUserActioner', function() {
        actionMediator.init();

        actionMediator.dispatch({name: 'registerUserActioner', payload: 'hhhhhh'});

    });


});

