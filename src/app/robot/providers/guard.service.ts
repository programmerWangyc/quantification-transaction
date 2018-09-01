import { Injectable } from '@angular/core';

import { BaseGuard } from '../../base/guard.service';
import { TipService } from '../../providers/tip.service';

@Injectable()
export class RobotGuard extends BaseGuard {
    constructor(
        public tip: TipService,
    ) {
        super(tip);
    }
}
