import { BtNodeNamePipe } from './bt-node.pipe';
import { KLinePeriodPipe } from './k-line-period.pipe';
import {
    DirectionTypePipe,
    Eid2StringPipe,
    ExtraBcgColorPickerPipe,
    ExtraColorPickerPipe,
    ExtraContentPipe,
    LogPricePipe,
    LogTypePipe,
    PlatformStockPipe,
    RobotOperateBtnTextPipe,
    RobotPublicStatusPipe,
    RobotStatusPipe,
    ShowExtraIconPipe,
    StrategyChartTitlePipe,
} from './robot.pipe';

export const PIPES = [
    KLinePeriodPipe,
    RobotStatusPipe,
    RobotPublicStatusPipe,
    PlatformStockPipe,
    BtNodeNamePipe,
    Eid2StringPipe,
    LogTypePipe,
    DirectionTypePipe,
    LogPricePipe,
    ExtraContentPipe,
    ShowExtraIconPipe,
    ExtraBcgColorPickerPipe,
    ExtraColorPickerPipe,
    StrategyChartTitlePipe,
    RobotOperateBtnTextPipe,
]
