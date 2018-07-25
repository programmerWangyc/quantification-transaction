import { Pipe, PipeTransform } from '@angular/core';

import { K_LINE_PERIOD } from '../../providers/constant.service';


@Pipe({ name: 'kLinePeriod' })
export class KLinePeriodPipe implements PipeTransform {
    transform(source: any[]): string {
        const [id] = source;

        const target = K_LINE_PERIOD.find(item => item.id === id);

        return target.period;
    }
}
