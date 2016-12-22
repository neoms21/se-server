import {ICommand} from './ICommand';
import {ICommandHandler} from './ICommandHandler';
import {Observable} from 'rxjs';


export class CommandHandlerBase<T extends ICommand> implements ICommandHandler<T>{

    private _command: T;

    constructor(command: T) {
        this._command = command;
    }

    public get command() {
        return this._command;
    }

    public execute(command: T) {
    }

    public verify(): Observable<string> {
        return null;
    }
}
