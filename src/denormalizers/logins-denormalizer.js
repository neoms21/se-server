'use strict';
const MongoRepository = require('../db/mongo-repository');

function handleRegisterUser(event) {
    // check whether user has a login
    MongoRepository.getCount('logins', {userName: event.userName})
        .subscribe(function (count) {
            if (count > 0) {
                // oops duplicate
                //response.onError(['The username @ ' + event.userName + ' is a duplicate']);
            } else {
                const login = {name: event.name, userName: event.userName, password: event.password};
                MongoRepository.insert('logins', login);
            }
        }, function () {

            //response.onError(err); // pass it on
        });
}

function getMessages() {
    return ['UserRegisteredEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    handleMessage: handleRegisterUser,
    getMessages: getMessages
};
