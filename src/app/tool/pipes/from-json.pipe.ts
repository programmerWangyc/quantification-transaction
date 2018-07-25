import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fromJSON' })
export class FromJSONPipe implements PipeTransform {
    transform(source: string): any {
        return JSON.parse(source);
    }
}
