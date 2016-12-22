import {EventBase} from '../../bases/EventBase';

export class SaveCommandEvent extends EventBase {

    constructor(correlationId: string) {
        super(correlationId, true);
    }
}
