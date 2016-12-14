class CommandMediatorInitiated {

    constructor(cmdCount) {
        this.cmdCount =  cmdCount;
    }

    get commandCount() {
        return this.cmdCount;
    }

    set commandCount(cnt) {
        this.cmdCount = cnt;
    }
}

module.exports = CommandMediatorInitiated;
