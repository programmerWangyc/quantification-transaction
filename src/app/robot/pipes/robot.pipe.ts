import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { zip } from 'lodash';
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

export interface PlatformStockPair {
    platform: string;
    stock: string;
}
@Pipe({ name: 'platformStock' })
export class PlatformStockPipe implements PipeTransform {
    transform(source: any[][]): PlatformStockPair[] {
        const [, platforms, stocks] = source;

        return zip(platforms, stocks).map(ary => ({ platform: ary[0] === -1 ? 'BotVS' : ary[0], stock: ary[1] }));
    }
}

@Pipe({ name: 'strategyChartTitle' })
export class StrategyChartTitlePipe implements PipeTransform {
    constructor(private translate: TranslateService) { }

    transform(source: Highcharts.Options, index: number): string {
        if (!!source.title && !!source.title.text) {
            return source.title.text;
        } else {
            let str = '';

            this.translate.get('STRATEGY_DEFAULT_TITLE', { index }).subscribe(label => str = label);

            return str;
        }
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
