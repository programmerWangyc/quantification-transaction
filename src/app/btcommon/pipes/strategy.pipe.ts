import { Pipe, PipeTransform } from '@angular/core';
import { Strategy } from '../../interfaces/response.interface';
import { CategoryType } from '../../interfaces/request.interface';


@Pipe({
    name: 'strategyName'
})
export class StrategyNamePipe implements PipeTransform {
    transform(target: Strategy): string {
        let name = target.name;

        return target.category === CategoryType.TEMPLATE_SNAPSHOT ? name.substring(name.indexOf('-') + 1) : name;
    }
}
