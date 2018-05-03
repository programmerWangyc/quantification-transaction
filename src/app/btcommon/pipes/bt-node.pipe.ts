import { Pipe, PipeTransform } from '@angular/core';

import { BtNode } from '../../interfaces/response.interface';


@Pipe({
    name: 'btNodeName'
})
export class BtNodeNamePipe implements PipeTransform {
    transform(source: BtNode): string {
        const { region, ip, os, name, id} = source;

        if (source.public == 1 && !source.is_owner) {
            return `${region} : ${ip} - ${os}`
        } else {
            return `${id} : ${ip} - ${os}${typeof name === 'string' ? name: ''}`
        }
    }
}