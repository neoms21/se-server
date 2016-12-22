import {EventBase} from '../../bases/EventBase';

export class CommandVerificationFailedEvent extends EventBase {
    messages: Array<string>;

    constructor(correlationId: string) {
        super(correlationId, true);
    }

    toString(): string {
        return super.toString();
    }
}
