var MongoRepository = require('../db/mongo-repository');

function handleRegisterUser(event) {
    // check whether user has a login
    MongoRepository.getCount('logins', {userName: event.userName})
        .subscribe(function (count) {
            if (count > 0) {
                // oops duplicate
                response.onError(['The username @ ' + event.userName + ' is a duplicate']);
            } else {
                var login = new Login(event.name, event.userName, event.password);
                MongoRepository.insert('logins', login);
                response.onNext('Registered user ' + login.name);
                response.onCompleted();
            }
        }, function (err) {
            response.onError(err); // pass it on
        });
}

module.exports = {
    handleRegisterUser: handleRegisterUser
};
