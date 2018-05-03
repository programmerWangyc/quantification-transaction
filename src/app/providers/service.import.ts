import { UtilService } from './util.service';
import { BtNodeService } from './bt-node.service';
import { ConstantService } from './constant.service';
import { EncryptService } from './encrypt.service';
import { ErrorService } from './error.service';
import { PlatformService } from './platform.service';
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
    BtNodeService,
    PlatformService,
    ConstantService,
    UtilService,
];

