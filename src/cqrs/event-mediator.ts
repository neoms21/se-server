import {IEvent} from '../bases/IEvent';
import MongoRepository from '../db/mongo-repository';
import {Subject} from 'rxjs';
import {Logger} from 'bunyan';
import {ICommand} from '../bases/ICommand';

export class EventMediator {
    public static propagator: Subject<IEvent>;
    private static logger: Logger;

    public static init(logger: Logger) {
        this.logger = logger;
        this.propagator = new Subject<IEvent>();
    }

    public static dispatch(event: IEvent) {
        // save the event
        MongoRepository.insert('events', event);

        // publish it to whomever is listening
        this.propagator.next(event);

        // log it
        this.logger.info(`${event.toString()} dispatched`);
    }

    public static create<T extends IEvent>(prototype:any, command: ICommand): T {
        let instance = <T>Object.create(prototype);
        instance.constructor.call(instance, command.correlationId);

        return instance;
    }
}
