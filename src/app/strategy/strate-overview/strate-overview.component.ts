import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Strategy, StrategyPublicState } from '../../interfaces/response.interface';
import { StrategyService } from '../providers/strategy.service';


function getLength<T>(data: T[]): number {
    return data.length;
}

@Component({
    selector: 'app-strate-overview',
    templateUrl: './strate-overview.component.html',
    styleUrls: ['./strate-overview.component.scss']
})
export class StrateOverviewComponent implements OnInit {
    total: Observable<number>;

    publishCount: Observable<number>;

    soldCount: Observable<number>;

    expireCount: Observable<number>;

    constructor(
        private strategyService: StrategyService
    ) { }

    ngOnInit() {
        const getLengthOperator = map(getLength);

        this.total = this.strategyService.getStrategies().pipe(getLengthOperator);

        this.publishCount = this.strategyService.getSpecificStrategies(this.isPublished).pipe(getLengthOperator);

        this.soldCount = this.strategyService.getSpecificStrategies(this.isSold).pipe(getLengthOperator);

        this.expireCount = this.strategyService.getSpecificStrategies(this.isExpired).pipe(getLengthOperator);
    }

    isPublished(data: Strategy): boolean {
        return data.is_owner && data.public !== StrategyPublicState.UNDISCLOSED;
    }

    isSold(data: Strategy): boolean {
        return data.is_owner && (data.public === StrategyPublicState.PREMIUM || !!data.buy_count);
    }

    isExpired(data: Strategy): boolean {
        return !data.is_owner && (moment(data.expire_date).diff(moment()) < 0);
    }

}
