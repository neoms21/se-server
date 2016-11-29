const config = require('config');
var dbUtil = require('./dbUtil');




module.exports = createOrOpenDb;

//  var uri = 'mongodb://' + configDB.user + ':' + configDB.password + '@' + configDB.Url + ':' + '/' + configDB.name;