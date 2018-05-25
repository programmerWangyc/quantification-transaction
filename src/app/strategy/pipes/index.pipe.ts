import {
    CommandButtonTextPipe,
    RemoveMd5Pipe,
    StrategyNamePipe,
    VariableToSelectListPipe,
    VariableTypePipe,
} from './strategy.pipe';



export const PIPES = [
    StrategyNamePipe,
    RemoveMd5Pipe,
    CommandButtonTextPipe,
    VariableTypePipe,
    VariableToSelectListPipe,
];
