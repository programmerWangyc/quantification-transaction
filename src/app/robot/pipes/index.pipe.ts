import { BtNodeNamePipe } from './bt-node.pipe';
import { KLinePeriodPipe } from './k-line-period.pipe';
import {
    PlatformStockPipe, RobotOperateBtnTextPipe, RobotPublicStatusPipe, RobotStatusPipe, StrategyChartTitlePipe, PluckContentPipe, SummaryInfoPipe
} from './robot.pipe';

export const PIPES = [
    BtNodeNamePipe,
    KLinePeriodPipe,
    PlatformStockPipe,
    PluckContentPipe,
    RobotOperateBtnTextPipe,
    RobotPublicStatusPipe,
    RobotStatusPipe,
    StrategyChartTitlePipe,
    SummaryInfoPipe,
];
