const assert = require('assert');
const command = require('./registerUserCommand');
const sinon = require('sinon');
const dbUtil = require('../../db/dbUtil');
const Rx = require('rx');

describe('Register user command', function () {
    let dbUtilStub;
    let dbMock;
    let insertOneMock;
    let count = 0;

    before(function () {
        dbMock = {
            collection: function () {
                return { count: (callback) => callback(null, count), insertOne: () => {} };
            }
        };
        dbUtilStub = sinon.stub(dbUtil, 'connectToDb', function () {
            // supply dummy observable
            return Rx.Observable.from(dbMock);
        });

        insertOneMock = sinon.stub(dbMock.collection(), 'insertOne');

    });

    it('should allow add for non matching login', function () {
        let resp = command();

        assert(insertOneMock.called);
    });



});
