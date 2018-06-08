import {
    CommandButtonTextPipe,
    ExpireStatusPipe,
    LatestModifyDesPipe,
    RemoveMd5Pipe,
    StrategyNamePipe,
    VariableToSelectListPipe,
    VariableTypeNamePipe,
    VariableTypePipe,
} from './strategy.pipe';



export const PIPES = [
    StrategyNamePipe,
    RemoveMd5Pipe,
    CommandButtonTextPipe,
    VariableTypePipe,
    VariableToSelectListPipe,
    LatestModifyDesPipe,
    ExpireStatusPipe,
    VariableTypeNamePipe,
];
