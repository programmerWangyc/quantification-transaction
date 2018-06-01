import { Injectable } from '@angular/core';

import { VariableTypeDes } from '../../interfaces/app.interface';
import { ConstantService } from '../../providers/constant.service';

@Injectable()
export class StrategyConstantService extends ConstantService {

    constructor() {
        super();
    }

    getArgSelectedItem(id: number): VariableTypeDes {
        if (id > 5 || id < 0) {
            throw new RangeError('Range error: ID passed in is out of range;');
        }
        return this.VARIABLE_TYPES.find(item => item.id === id);
    }
}
