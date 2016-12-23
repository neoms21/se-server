'use strict';
var config = require('config');
var mongoClient = require('mongodb');
var Rx = require('rxjs');

var mongoRepository = {};

mongoRepository.init = function (logger) {
    this.logger = logger;
};

mongoRepository.connectToDb = function () {

    if (this.connection === undefined) {
        var configDB = config.get < DbConfig > ("dbConfig");

        // create uri no user
        var uri = 'mongodb://' + configDB.host + ':' + configDB.port + '/' + configDB.name;
        this.logger.info('trying to connect to ' + uri + ' for db');

        // Connect to the db
        this.connection = mongoClient.connect(uri);
    }

    return this.connection;
};


public
static
getCount(collectionName
:
string, param
:
any
):
Rx.Observable < number > {
    // so many layers of rx!
    let response = new Rx.Subject < number > ();

this.connectToDb()
    .then((db
:
Db
)
=
>
{
    db.collection(collectionName).count(param, (err
:
    any, count
:
    number
)
    =
>
    {
        response.next(count);
        response.complete();
    }
)
    ;
}
,
(err
:
any
)
=
>
{
    response.error(err);
}
)
;

return response;
}

public
static
insert(collectionName
:
string, insertion
:
any
)
{
    let response = new Rx.Subject();

    this.connectToDb()
        .then((db
:
    Db
)
    =
>
    {
        db.collection(collectionName).insertOne(insertion)
            .then((succ
    :
        InsertOneWriteOpResult
    )
        =
    >
        {
            response.next(succ);
            response.complete();
        }
    )
    .
        catch((errInsert
    :
        any
    )
        =
    >
        {
            response.error(errInsert);
        }
    )
        ;
    }
,
    (err
:
    any
)
    =
>
    {
        response.error(err);
    }
)
    ;

    return response;
}

public
static
createOrOpenDb()
:
Rx.Observable < string > {
    let response = new Rx.Subject < string > ();

this.connectToDb()
    .then(function (db
:
Db
)
{
    db.createCollection('commands', function (err
:
    any, collection
:
    any
)
    {
    }
)
    ;
    db.createCollection('events', function (err
:
    any, collection
:
    any
)
    {
    }
)
    ;
    db.createCollection('checkpoints', function (err
:
    any, collection
:
    any
)
    {
    }
)
    ;
    db.createCollection('clubs', function (err
:
    any, collection
:
    any
)
    {
    }
)
    ;
    db.createCollection('teams', function (err
:
    any, collection
:
    any
)
    {
    }
)
    ;
    db.createCollection('logins', function (err
:
    any, collection
:
    any
)
    {
    }
)
    ;
}
)
.
catch((err
:
any
)
=
>
response.error(err.toString())
)
;

return response;
}
}

//
// module.exports = {
//     getCount: getCount,
//     insert: insert,
//     createOrOpenDb: createOrOpenDb
// };
