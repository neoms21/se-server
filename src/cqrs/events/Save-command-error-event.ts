import {EventBase} from '../../bases/EventBase';

export class SaveCommandErrorEvent extends EventBase {
    error: string;

    constructor(correlationId: string) {
        super(correlationId, true);
    }
}
