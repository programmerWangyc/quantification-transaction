import { EncryptService } from './encrypt.service';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { PublicService } from './public.service';
import { TipService } from './tip.service';
import { WebsocketService } from './websocket.service';


export const GLOBAL_SERVICES = [
    ErrorService,
    WebsocketService,
    ProcessService,
    EncryptService,
    TipService,
    PublicService,
];

