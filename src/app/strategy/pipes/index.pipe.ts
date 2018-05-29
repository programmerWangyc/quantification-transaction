import {
    CommandButtonTextPipe,
    RemoveMd5Pipe,
    StrategyNamePipe,
    VariableToSelectListPipe,
    VariableTypePipe,
    LatestModifyDesPipe,
    ExpireStatusPipe,
} from './strategy.pipe';



export const PIPES = [
    StrategyNamePipe,
    RemoveMd5Pipe,
    CommandButtonTextPipe,
    VariableTypePipe,
    VariableToSelectListPipe,
    LatestModifyDesPipe,
    ExpireStatusPipe,
];
