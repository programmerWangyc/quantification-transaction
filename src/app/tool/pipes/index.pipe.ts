import {
    BalancePipe, BtNodeNamePipe, BytesPipe, CategoryColorPipe, CategoryNamePipe, CommandButtonTextPipe, FromJSONPipe,
    FromNowPipe, KLinePeriodPipe, OriginDataPipe, PlatformStockPipe, ProgramLanguagePipe, RemoveMd5Pipe, SafeHtmlPipe,
    StrategyNamePipe, TemplateNamePipe, ToMarkdownPipe, VariableToSelectListPipe, VariableTypePipe, SummaryInfoPipe, PluckContentPipe, StrategyChartTitlePipe, StrategyDescriptionPipe
} from './common.pipe';
import {
    DirectionTypePipe, Eid2StringPipe, ExtraBcgColorPickerPipe, ExtraColorPickerPipe, ExtraContentPipe, LogPricePipe,
    LogTypePipe, ShowExtraIconPipe
} from './log.pipe';

export const PIPES = [
    BalancePipe,
    BtNodeNamePipe,
    BytesPipe,
    CategoryColorPipe,
    CategoryNamePipe,
    CommandButtonTextPipe,
    DirectionTypePipe,
    Eid2StringPipe,
    ExtraBcgColorPickerPipe,
    ExtraColorPickerPipe,
    ExtraContentPipe,
    FromJSONPipe,
    FromNowPipe,
    KLinePeriodPipe,
    LogPricePipe,
    LogTypePipe,
    OriginDataPipe,
    PlatformStockPipe,
    PluckContentPipe,
    ProgramLanguagePipe,
    RemoveMd5Pipe,
    SafeHtmlPipe,
    ShowExtraIconPipe,
    StrategyDescriptionPipe,
    StrategyChartTitlePipe,
    StrategyNamePipe,
    SummaryInfoPipe,
    TemplateNamePipe,
    ToMarkdownPipe,
    VariableToSelectListPipe,
    VariableTypePipe,
];
