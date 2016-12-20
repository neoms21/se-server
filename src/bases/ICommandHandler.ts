import {ICommand} from './ICommand';

export interface ICommandHandler {
    execute();
    verify();
    command: ICommand;

}
