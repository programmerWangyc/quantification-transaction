import { BtNodeService } from './bt-node.service';
import { ChartService } from './chart.service';
import { ConstantService } from './constant.service';
import { EncryptService } from './encrypt.service';
import { ErrorService } from './error.service';
import { PlatformService } from './platform.service';
import { ProcessService } from './process.service';
import { PublicService } from './public.service';
import { RoutingService } from './routing.service';
import { TipService } from './tip.service';
import { UtilService } from './util.service';
import { WebsocketService } from './websocket.service';
import { ExchangeService } from './exchange.service';
import { CommentService } from './comment.service';

export const GLOBAL_SERVICES = [
    BtNodeService,
    ChartService,
    CommentService,
    ConstantService,
    EncryptService,
    ErrorService,
    ExchangeService,
    PlatformService,
    ProcessService,
    PublicService,
    RoutingService,
    TipService,
    UtilService,
    WebsocketService,
];

