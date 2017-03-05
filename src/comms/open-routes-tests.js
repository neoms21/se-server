'use strict';
const openRoutes = require('./open-routes');
const assert = require('assert');
const sinon = require('sinon');
const cors = require('cors');

describe('Open routes ', () => {
    describe('setup', () => {
        it('should have been created correctly', () => {
            assert.notEqual(openRoutes, null);
            assert.notEqual(openRoutes, undefined);
        });

    });

    describe('server related', () => {
        let server = {
            use: function () {
            }, post: function () {
            }
        };
        let logger;
        let corsSpy;
        let useSpy;
        let postSpy;

        beforeEach(() => {
            //corsSpy = sinon.spy(cors);
            useSpy = sinon.spy(server, 'use');
            postSpy = sinon.spy(server, 'post');
        });

        afterEach(() => {
           useSpy.restore();
           postSpy.restore();
        });

        it('should use cors', () => {
            openRoutes(server);
            // assert(stub.calledWith({origin: '*'}));
            assert(useSpy.called);
            //assert(corsSpy.called);
        });

        it('should use post to set up login', () => {
            openRoutes(server);
            // assert(stub.calledWith({origin: '*'}));
            assert(postSpy.called);
            assert(postSpy.calledWith('/login'));
            // assert(corsSpy.called);
        });
    });

});
