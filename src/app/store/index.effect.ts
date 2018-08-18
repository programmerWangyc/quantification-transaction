import { AuthEffect } from './auth/auth.effect';
import { BacktestEffect } from './backtest/backtest.effect';
import { BBSEffect } from './bbs/bbs.effect';
import { BtNodeEffect } from './bt-node/bt-node.effect';
import { ChargeEffect } from './charge/charge.effect';
import { CommentEffect } from './comment/comment.effect';
import { DocumentEffect } from './document/document.effect';
import { ExchangeEffect } from './exchange/exchange.effect';
import { PlatformEffect } from './platform/platform.effect';
import { PublicEffect } from './public/public.effect';
import { RobotEffect } from './robot/robot.effect';
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
];

export const DASHBOARD_EFFECTS = [
    BacktestEffect,
    BtNodeEffect,
    ChargeEffect,
    PlatformEffect,
    RobotEffect,
    SimulationEffect,
    StrategyEffect,
    WatchDogEffect,
];
