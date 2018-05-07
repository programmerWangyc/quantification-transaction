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
    RobotCommandButtonTextPipe,
    RobotPublicStatusPipe,
    RobotStatusPipe,
    ShowExtraIconPipe,
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
    Eid2StringPipe,
    LogTypePipe,
    DirectionTypePipe,
    LogPricePipe,
    ExtraContentPipe,
    ShowExtraIconPipe,
    ExtraBcgColorPickerPipe,
    ExtraColorPickerPipe,
]