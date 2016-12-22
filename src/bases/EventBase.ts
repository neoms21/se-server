import {IEvent} from './IEvent';

export class EventBase implements IEvent {
    private _isSystem: boolean;
    private _name: string;
    private _correlationId: string;

    constructor(correlationId: string, isSystemEvent: boolean = false) {
        this._correlationId = correlationId;
        this._name = this.toString();
        this._isSystem = isSystemEvent;
    }

    get correlationId(): string {
        return this._correlationId;
    }

    get name(): string {
        return this._name;
    }

    get isSystem(): boolean {
        return this._isSystem;
    }

    toString(): string {
        return `Event ${this.constructor.name} corr id ${this.correlationId}`;
    }
}