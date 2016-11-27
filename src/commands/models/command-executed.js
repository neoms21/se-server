class CommandExecuted {

    constructor(id) {
        this._id =  id;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }
}

module.exports = CommandExecuted;
