import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { StrategyService } from '../providers/strategy.service';
import { Strategy, StrategyPublicState } from '../../interfaces/response.interface';
import * as moment from 'moment';

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
        this.total = this.strategyService.getStrategies().map(getLength);

        this.publishCount = this.strategyService.getSpecificStrategies(this.isPublished).map(getLength);

        this.soldCount = this.strategyService.getSpecificStrategies(this.isSold).map(getLength);

        this.expireCount = this.strategyService.getSpecificStrategies(this.isExpired).map(getLength);
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
