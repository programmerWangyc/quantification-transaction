import { Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Robot, RobotPublicStatus, RobotStatus } from '../../interfaces/response.interface';
import { RobotOperateType } from '../../store/robot/robot.reducer';
import { RobotConstantService } from '../providers/robot.constant.service';
import { RobotOperateService } from '../providers/robot.operate.service';

@Pipe({ name: 'robotStatus' })
export class RobotStatusPipe implements PipeTransform {
    transform(status: number): string {
        return RobotStatus[status];
    }
}

@Pipe({ name: 'robotPublicStatus' })
export class RobotPublicStatusPipe implements PipeTransform {
    transform(status: number): string {
        return RobotPublicStatus[status];
    }
}

@Pipe({ name: 'robotOperateBtnText' })
export class RobotOperateBtnTextPipe implements PipeTransform {
    constructor(
        private robotOperate: RobotOperateService,
        private constantService: RobotConstantService,
    ) { }

    transform(robot: Robot): Observable<string> {
        return this.robotOperate.isCurrentRobotOperating(
            robot,
            robot.status > 2 ? RobotOperateType.restart : RobotOperateType.stop
        ).pipe(map(loading => {
            const btnTexts = this.constantService.getRobotOperateMap(robot.status).btnText;

            return this.constantService.getRobotOperateBtnText(loading, btnTexts);
        }));
    }
}
