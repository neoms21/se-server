import {EventBase} from '../../bases/EventBase';

export class CommandVerificationFailedEvent extends EventBase {
    messages: Array<string>;

    constructor(correlationId: number, messages: Array<string>) {
        super(correlationId);
        this.messages = messages;
    }
}
