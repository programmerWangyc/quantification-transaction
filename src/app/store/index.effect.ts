import { AccountEffect } from './account/account.effect';
import { AuthEffect } from './auth/auth.effect';
import { BacktestEffect } from './backtest/backtest.effect';
import { BBSEffect } from './bbs/bbs.effect';
import { BtNodeEffect } from './bt-node/bt-node.effect';
import { ChargeEffect } from './charge/charge.effect';
import { CommentEffect } from './comment/comment.effect';
import { DocumentEffect } from './document/document.effect';
import { ExchangeEffect } from './exchange/exchange.effect';
import { MessageEffect } from './message/message.effect';
import { PlatformEffect } from './platform/platform.effect';
import { PublicEffect } from './public/public.effect';
import { RobotEffect } from './robot/robot.effect';
import { RouterEffect } from './router/router.effect';
import { SimulationEffect } from './simulation/simulation.effect';
import { StrategyEffect } from './strategy/strategy.effect';
import { WatchDogEffect } from './watch-dog/watch-dog.effect';

export const EFFECTS = [
    AuthEffect,
    BBSEffect,
    CommentEffect,
    DocumentEffect,
    ExchangeEffect,
    PublicEffect,
    RouterEffect,
];

export const DASHBOARD_EFFECTS = [
    AccountEffect,
    BacktestEffect,
    BtNodeEffect,
    ChargeEffect,
    MessageEffect,
    PlatformEffect,
    RobotEffect,
    SimulationEffect,
    StrategyEffect,
    WatchDogEffect,
];
