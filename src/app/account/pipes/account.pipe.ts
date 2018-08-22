import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'accountAlive' })
export class AccountAlivePipe implements PipeTransform {
    transform(value: number): string {
        if (!!value && value > 0) {
            return moment(value / 1000000).format('YYYY-MM-DD HH:mm:ss');
        } else {
            return '--';
        }
    }
}
