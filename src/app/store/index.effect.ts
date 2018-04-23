import { AuthEffect } from './auth/auth.effect';
import { BtNodeEffect } from './bt-node/bt-node.effect';
import { PlatformEffect } from './platform/platform.effect';
import { PublicEffect } from './public/public.effect';
import { RobotEffect } from './robot/robot.effect';

export const EFFECTS = [
    PublicEffect,
    AuthEffect,
];

export const DASHBOARD_EFFECTS = [
    RobotEffect,
    BtNodeEffect,
    PlatformEffect,
]