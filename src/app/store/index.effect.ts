import { AuthEffect } from './auth/auth.effect';
import { BacktestEffect } from './backtest/backtest.effect';
import { BtNodeEffect } from './bt-node/bt-node.effect';
import { ChargeEffect } from './charge/charge.effect';
import { PlatformEffect } from './platform/platform.effect';
import { PublicEffect } from './public/public.effect';
import { RobotEffect } from './robot/robot.effect';
import { StrategyEffect } from './strategy/strategy.effect';
import { WatchDogEffect } from './watch-dog/watch-dog.effect';

export const EFFECTS = [
    PublicEffect,
    AuthEffect,
];

export const DASHBOARD_EFFECTS = [
    RobotEffect,
    BtNodeEffect,
    PlatformEffect,
    WatchDogEffect,
    StrategyEffect,
    ChargeEffect,
    BacktestEffect,
]
