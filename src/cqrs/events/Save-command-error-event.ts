import {EventBase} from '../../bases/EventBase';

export class SaveCommandErrorEvent extends EventBase {
    constructor(correlationId: number) {
        super(correlationId);
    }
}
