import { Pipe, PipeTransform } from '@angular/core';

import { kLinePeriod } from '../../interfaces//constant.interface';


@Pipe({
    name: 'kLinePeriod'
})
export class KLinePeriodPipe implements PipeTransform {
    transform(source: any[]): string {
        const [id] = source;

        const target = kLinePeriod.find(item => item.id === id);

        return target.period;
    }
}