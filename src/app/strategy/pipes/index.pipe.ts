import {
    CommandButtonTextPipe,
    ExpireStatusPipe,
    LatestModifyDesPipe,
    RemoveMd5Pipe,
    StrategyNamePipe,
    VariableToSelectListPipe,
    VariableTypeNamePipe,
    VariableTypePipe,
    VariableValuePipe,
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
    VariableValuePipe,
];
