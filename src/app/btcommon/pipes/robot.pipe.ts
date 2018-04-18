import { Pipe, PipeTransform } from '@angular/core';

import { RobotPublicStatus, RobotStatus } from '../../interfaces/response.interface';


@Pipe({
    name: 'robotStatus'
})
export class RobotStatusPipe implements PipeTransform {
    transform(status: number): string {
        return  RobotStatus[status];
    }
}

@Pipe({
    name: 'robotPublicStatus'
})
export class RobotPublicStatusPipe implements PipeTransform {
    transform(status: number): string {
        return  RobotPublicStatus[status];
    }
}