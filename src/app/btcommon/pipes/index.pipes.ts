import { BtNodeNamePipe } from './bt-node.pipe';
import { KLinePeriodPipe } from './k-line-period.pipe';
import {
    PlatformStockPipe,
    RobotCommandButtonTextPipe,
    RobotPublicStatusPipe,
    RobotStatusPipe,
    VariableToSelectListPipe,
    VariableTypePipe,
} from './robot.pipe';

export const PIPES = [
    KLinePeriodPipe,
    RobotStatusPipe,
    RobotPublicStatusPipe,
    PlatformStockPipe,
    BtNodeNamePipe,
    VariableTypePipe,
    VariableToSelectListPipe,
    RobotCommandButtonTextPipe,
]