import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'bytes'
})
export class BytesPipe implements PipeTransform {
    transform(input: number, precision: number = 2): string | number {
        if (isNaN(input) || !isFinite(input)) return '-';

        if (input <= 0) return input;

        const units = ['input', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const number = Math.floor(Math.log(input) / Math.log(1024));

        return (input / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }
}
