import {IEvent} from '../bases/IEvent';
import IObservable = Rx.IObservable;
import Subject = Rx.Subject;
import MongoRepository from '../db/mongo-repository';

export class EventMediator {
    public static propagator: Subject<IEvent>;

    constructor() {
        EventMediator.propagator = new Subject<IEvent>();
    }

    public static dispatch(event: IEvent) {
        // save the event
        MongoRepository.insert('events', event);

        // publish it to whomever is listening
        EventMediator.propagator.onNext(event);
    }
}
