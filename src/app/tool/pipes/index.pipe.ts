import { BytesPipe, FromJSONPipe, FromNowPipe, OriginDataPipe, SafeHtmlPipe, ToMarkdownPipe } from './common.pipe';
import {
    DirectionTypePipe, Eid2StringPipe, ExtraBcgColorPickerPipe, ExtraColorPickerPipe, ExtraContentPipe, LogPricePipe,
    LogTypePipe, ShowExtraIconPipe
} from './log.pipe';

export const PIPES = [
    FromNowPipe,
    FromJSONPipe,
    SafeHtmlPipe,
    OriginDataPipe,
    BytesPipe,
    Eid2StringPipe,
    DirectionTypePipe,
    LogTypePipe,
    LogPricePipe,
    ToMarkdownPipe,
    ExtraContentPipe,
    ShowExtraIconPipe,
    ExtraColorPickerPipe,
    ExtraBcgColorPickerPipe,
];
