
export class EventBase {
    private _correlationId: number;

    constructor(correlationId: number) {
        this._correlationId = correlationId;
    }

    get correlationId(): number {
        return this._correlationId;
    }
}