import {EventBase} from '../../bases/EventBase';

export class CommandVerificationFailedEvent extends EventBase {
    messages: Array<string>;
}
