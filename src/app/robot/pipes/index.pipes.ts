import { BtNodeNamePipe } from './bt-node.pipe';
import { KLinePeriodPipe } from './k-line-period.pipe';
import {
    PlatformStockPipe, RobotOperateBtnTextPipe, RobotPublicStatusPipe, RobotStatusPipe, StrategyChartTitlePipe
} from './robot.pipe';

export const PIPES = [
    KLinePeriodPipe,
    RobotStatusPipe,
    RobotPublicStatusPipe,
    PlatformStockPipe,
    BtNodeNamePipe,
    StrategyChartTitlePipe,
    RobotOperateBtnTextPipe,
];
