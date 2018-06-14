import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { CompareLogic } from '../providers/backtest.constant.service';



@Pipe({
    name: 'optimizeFilterDes'
})
export class OptimizeFilterDesPipe implements PipeTransform {
    constructor(
        private translate: TranslateService,
    ) { }

    transform(target: Filter): string {
        let result = '';

        if (target.logic.id === CompareLogic.EQUAL) {
            this.translate.get('COMPARE_DESCRIPTION2', { compare: target.compareVariable.variableDes, compared: target.comparedVariable.variableDes })
                .subscribe(label => result = label);
        } else {
            this.translate.get(target.logic.id === CompareLogic.MORE_THAN ? 'LARGE' : 'SMALL')
                .mergeMap(logic => this.translate.get('COMPARE_DESCRIPTION', { compare: target.compareVariable.variableDes, compared: target.comparedVariable.variableDes, logic, value: target.baseValue }))
                .subscribe(label => result = label);
        }

        return result;
    }
}
