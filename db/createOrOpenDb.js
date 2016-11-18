const config = require('config');
var dbUtil = require('./dbUtil');


function createOrOpenDb(log) {

    dbUtil(log)
        .then(function (db) {
            db.createCollection('commands', function (err, collection) {
            });
            db.createCollection('checkpoints', function (err, collection) {
            });
            db.createCollection('clubs', function (err, collection) {
            });
            db.createCollection('teams', function (err, collection) {
            });
            db.createCollection('logins', function (err, collection) {
            });
            log.info("Collections checked (and maybe created)");
        });

}

module.exports = createOrOpenDb;

//  var uri = 'mongodb://' + configDB.user + ':' + configDB.password + '@' + configDB.Url + ':' + '/' + configDB.name;