import {IEvent} from './IEvent';

export class EventBase implements IEvent {
    private _eventName: string;
    private _isSystem: boolean;
    private _correlationId: string;

    constructor(correlationId: string, isSystemEvent: boolean = false) {
        this._correlationId = correlationId;
        this._isSystem = isSystemEvent;
        this.eventName = this.constructor.name;
    }

    get correlationId(): string {
        return this._correlationId;
    }

    set correlationId(id: string) {
        this._correlationId = id;
    }

    get eventName(): string {
        return this._eventName;
    }

    set eventName(eventName: string) {
        this._eventName = eventName;
    }

    get isSystem(): boolean {
        return this._isSystem;
    }

    toString(): string {
        return `Event ${this.eventName} corr id ${this.correlationId}`;
    }
}