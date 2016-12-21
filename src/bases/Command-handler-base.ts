import {ICommand} from './ICommand';
import {ICommandHandler} from './ICommandHandler';
import IObservable = Rx.IObservable;

export class CommandHandlerBase implements ICommandHandler{

    private command: ICommand;

    constructor(command: ICommand) {
        this.command = command;
    }

    public get command() {
        return this.command;
    }

    public execute(command: ICommand) {
    }

    public verify(): IObservable<string> {
        return null;
    }
}
