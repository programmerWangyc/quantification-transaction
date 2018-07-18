import { BytesPipe } from './bytes.pipe';
import { FromJSONPipe } from './from-json.pipe';
import {
    DirectionTypePipe,
    Eid2StringPipe,
    ExtraBcgColorPickerPipe,
    ExtraColorPickerPipe,
    ExtraContentPipe,
    LogPricePipe,
    LogTypePipe,
    ShowExtraIconPipe,
} from './log.pipe';
import { OriginDataPipe } from './origin-data.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';



export const PIPES = [
    FromJSONPipe,
    SafeHtmlPipe,
    OriginDataPipe,
    BytesPipe,
    Eid2StringPipe,
    DirectionTypePipe,
    LogTypePipe,
    LogPricePipe,
    ExtraContentPipe,
    ShowExtraIconPipe,
    ExtraColorPickerPipe,
    ExtraBcgColorPickerPipe,
]
