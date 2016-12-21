import {Observable} from 'rxjs';
import {ICommand} from './ICommand';

export interface ICommandHandler<T> {
    execute(command: T);
    verify(): Observable<string>;

}
