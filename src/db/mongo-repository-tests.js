var assert = require('assert');
var mongoRepository = require('../db/mongo-repository');
var sinon = require('sinon');
var mongoClient = require('mongodb');
var config = require('config');
var q = require('q');

describe('Mongo repository', function () {
    var mongoStub;
    var loggerStub;
    var loggerInfoStub;
    var configStub;

    before(function () {
        mongoStub = sinon.stub(mongoClient, 'connect');
        // create logger, add info method and then stub that
        loggerStub = sinon.stub();
        loggerStub.info = Function;
        loggerInfoStub = sinon.stub(loggerStub, 'info');
        // set up config
        configStub = sinon.stub(config, 'get').returns({host: 'myhost', port: 173, name: 'mydb'});
        // initialise our testee with our stub
        mongoRepository.init(loggerStub);

    });
    after(function () {
        mongoStub.restore();
        configStub.restore();
        loggerInfoStub.restore();
    });

    describe('connectToDb', function () {
        it('should use correct url', function () {
            var url = 'mongodb://myhost:173/mydb';
            mongoRepository.connectToDb();

            assert(mongoStub.calledWith(url));
            assert(loggerInfoStub.calledWith('Trying to connect to ' + url + ' for db'));
        });
    });

    describe('insert', function () {
        var connectionPromise;
        var insertPromise;

        beforeEach(function () {
            connectionPromise = q.defer();
            mongoStub.returns(connectionPromise.promise);

            //now do collection stuff
            insertPromise = q.defer();

            connectionPromise.resolve({
                collection: function () {
                    return {
                        insertOne: function () {
                            return insertPromise.promise;
                        }
                    };
                }
            });
        });

        it('should insert our data', function (done) {
            var ourData = {name: 'John', id: 100};
            mongoRepository.insert('commands', ourData)
                .subscribe(function (success) {
                    assert.deepEqual(success, ourData);
                    done();
                });

            // invoke the insert function
            insertPromise.resolve(ourData);
        });
        it('should get error back when mongo error', function (done) {
            mongoRepository.insert('commands')
                .subscribe(function () {
                }, function (err) {
                    assert.equal(err, 'error');
                    done();
                });

            // invoke the count function
            insertPromise.reject('error');
        });
    });

    describe('getCount', function () {
        var connectionPromise;
        var countPromise;
        var connectMock;

        beforeEach(function () {
            countPromise = q.defer();
            connectionPromise = q.defer();
            connectMock = sinon.stub(mongoRepository, 'connectToDb').returns(connectionPromise.promise);

            connectionPromise.resolve({
                collection: function () {
                    return {
                        count: function () {
                            return countPromise.promise;
                        }
                    };
                }
            });
        });
        afterEach(function () {
            connectMock.restore();
        });

        it('should get count back', function (done) {
            mongoRepository.getCount('commands')
                .subscribe(function (cnt) {
                    assert(cnt, 1);
                    done();
                });

            // invoke the count function

            countPromise.resolve(1);
        });
        it('should get error back when mongo error', function (done) {
            mongoRepository.getCount('commands')
                .subscribe(function (cnt) {
                    assert(cnt, 1);
                    done();
                }, function (err) {
                    assert.equal(err, 'error');
                    done();
                });

            // invoke the count function
            countPromise.reject('error');
        });
    });


});
