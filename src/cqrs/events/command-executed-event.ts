import {EventBase} from '../../bases/EventBase';

export class CommandExecutedEvent extends EventBase {
    commandId: string;

    constructor(correlationId: string, id: string) {
        super(correlationId, true);
        this.commandId = id;
    }
}
