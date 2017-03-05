'use strict';
const login = require('./login');
const assert = require('assert');
const sinon = require('sinon');
const Rx = require('rxjs/Rx');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');


describe('Login routes ', () => {

    describe('setup', () => {
        it('should have been created correctly', () => {
            assert.notEqual(login, null);
            assert.notEqual(login, undefined);
        });
    });

    describe('post login', () => {
        let request;
        let response;
        let logger;
        let statusSpy;
        let sendSpy;
        let mongoRepoStub;
        let loggerErrorSpy;
        let loggerInfoSpy;
        let jwtStub;

        beforeEach(() => {
            request = {body: {}};
            response = {
                status: () => {
                    return response;
                }, send: () => {
                }, json: () => {
                }
            };
            logger = {
                info: () => {
                }, error: () => {
                }
            };
            statusSpy = sinon.spy(response, 'status');
            sendSpy = sinon.spy(response, 'send');
            loggerErrorSpy = sinon.spy(logger, 'error');
            loggerInfoSpy = sinon.spy(logger, 'info');

            login.init(logger);
        });

        afterEach(() => {
            statusSpy.restore();
            sendSpy.restore();
            loggerErrorSpy.restore();
            loggerInfoSpy.restore();

        });

        it('should error if no user set in body', () => {
            login.postLogin(request, response);

            assert(statusSpy.calledWith(203));
            assert(sendSpy.calledWith('User details not defined'));
        });

        it('should error if user not set correctly in body', () => {
            request.body = {email: 'kkkkk', Password: '@@@'};
            login.postLogin(request, response);

            assert(statusSpy.calledWith(203));
            assert(sendSpy.calledWith('User details not defined correctly'));
        });

        it('should error if user half set correctly in body', () => {
            request.body = {userName: 'kkkkk', Password: '@@@'};
            login.postLogin(request, response);

            assert(statusSpy.calledWith(203));
            assert(sendSpy.calledWith('User details not defined correctly'));
        });

        it('should error if repo throws error', (done) => {
            mongoRepoStub = sinon.stub(mongoRepository, 'getCount')
                .returns(Rx.Observable.throw(new Error('DB Fault')));

            request.body = {userName: 'kkkkk', password: '@@@'};
            login.postLogin(request, response, logger);
            mongoRepoStub.restore();

            setTimeout(() => {
                assert(loggerErrorSpy.called);
                assert(loggerErrorSpy.calledWith('Database Error: DB Fault'));
                assert(statusSpy.called);
                assert(statusSpy.calledWith(500));
                done();
            }, 400);

        });

        it('should use post to set up login', (done) => {
            mongoRepoStub = sinon.stub(mongoRepository, 'getCount')
                .returns(Rx.Observable.of(1));
            jwtStub = sinon.stub(jwt, 'sign').returns('#token');
            let jsonStub = sinon.stub(response, 'json');

            request.body = {userName: 'kkkkk', password: '@@@'};
            login.postLogin(request, response, logger);

            setTimeout(() => {
                assert(loggerInfoSpy.called);
                assert(loggerInfoSpy.calledWith('Authenticated via login kkkkk'));
                assert(statusSpy.called);
                assert(statusSpy.calledWith(200));
                assert(jwtStub.called);
                assert(jwtStub.calledWith(request.body, jwtSecret, {expiresIn: 360 * 5}));
                assert(jsonStub.calledWith({token: '#token'}));
                mongoRepoStub.restore();
                jwtStub.restore();
                jsonStub.restore();
                done();
            }, 100);
        });
    });

});

