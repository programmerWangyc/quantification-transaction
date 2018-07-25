import { Injectable } from '@angular/core';

import { ConstantService } from '../../providers/constant.service';

export interface RobotOperateMap {
    tip: string;
    btnText: string[];
}

export const ROBOT_OPERATE_MAP: RobotOperateMap[] = [
    { btnText: ['RESTART', 'RESTARTING'], tip: 'RESTART_ROBOT_CONFIRM' },
    { btnText: ['STOP', 'STOPPING'], tip: 'STOP_ROBOT_CONFIRM' },
    { btnText: ['KILL'], tip: 'KILL_ROBOT_CONFIRM' },
];

@Injectable()
export class RobotConstantService extends ConstantService {

    ROBOT_OPERATE_MAP = ROBOT_OPERATE_MAP;

    constructor() {
        super();
    }

    getRobotOperateMap(status: number): RobotOperateMap {
        if (status > 2) {
            return ROBOT_OPERATE_MAP[0];
        } else if (status === 2) {
            return ROBOT_OPERATE_MAP[2];
        } else {
            return ROBOT_OPERATE_MAP[1];
        }
    }

    getRobotOperateBtnText(isLoading: boolean, texts: string[]): string {
        return isLoading ? texts[1] || texts[0] : texts[0];
    }
}
