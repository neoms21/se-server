'use strict';
const assert = require('assert');
const mongoRepository = require('../db/mongo-repository');
const sinon = require('sinon');
const mongoClient = require('mongodb');
const config = require('config');
const q = require('q');

describe('Mongo repository', function () {
    let mongoStub;
    let loggerStub;
    let loggerInfoStub;
    let configStub;

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
            let url = 'mongodb://myhost:173/mydb';
            mongoRepository.connectToDb();

            assert(mongoStub.calledWith(url));
            assert(loggerInfoStub.calledWith('Trying to connect to ' + url + ' for db'));
        });
    });

    describe('insert', function () {
        let connectionPromise;
        let insertPromise;

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
            let ourData = {name: 'John', id: 100};
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
        let connectionPromise;
        let countPromise;
        let connectMock;

        beforeEach(function () {
            countPromise = q.defer();
            connectionPromise = q.defer();
            mongoStub.returns(connectionPromise.promise);
            //connectMock = sinon.stub(mongoRepository, 'connectToDb').returns(connectionPromise.promise);

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
            //connectMock.restore();
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

    describe('query', function () {
        let connectionPromise;

        beforeEach(function () {
            connectionPromise = q.defer();
            mongoStub.returns(connectionPromise.promise);
        });
        afterEach(function () {

        });

        it('should get empty array back', function (done) {

            connectionPromise.resolve({
                collection: function () {
                    return {
                        find: function () {
                            return {
                                forEach: function (callback, finisher) {
                                    callback({});
                                    finisher(null);
                                }
                            }
                        }
                    }
                }
            });

            mongoRepository.query('commands', {})
                .subscribe((res) => {
                }, (err) => {
                }, () => {
                    done();
                });
        });

        it('should get one result back', function (done) {
            connectionPromise.resolve({
                collection: function () {
                    return {
                        find: function () {
                            return {
                                forEach: function (callback, finisher) {
                                    callback({name: 'John'});
                                    finisher(null);
                                }
                            }
                        }
                    }
                }
            });

            mongoRepository.query('commands', {name: 'John'})
                .subscribe((res) => {
                    assert.notEqual(res, null);
                    assert.equal(res.name, 'John');
                }, (err) => {
                }, () => {
                    done();
                });
        });

        it('should deal with error', function (done) {
            connectionPromise.resolve({
                collection: function () {
                    return {
                        find: function () {
                            return {
                                forEach: function (callback, finisher) {
                                    finisher('error');
                                }
                            }
                        }
                    }
                }
            });

            mongoRepository.query('commands', {name: 'John'})
                .subscribe((res) => {
                }, (err) => {
                    assert.equal(err, 'error');
                    done();
                });
        });
    });
});
