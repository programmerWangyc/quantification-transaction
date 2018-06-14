import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { of } from 'rxjs/observable/of';

import { SelectedPair } from '../../interfaces/app.interface';
import { GroupedList, UtilService } from '../../providers/util.service';
import { BacktestConstantService, BacktestPlatform } from '../providers/backtest.constant.service';

@Component({
    selector: 'app-exchange-options',
    templateUrl: './exchange-options.component.html',
    styleUrls: ['./exchange-options.component.scss']
})
export class ExchangeOptionsComponent implements OnInit {
    @Output() fixKlinePeriod: EventEmitter<number> = new EventEmitter();

    selectedStock = 0;

    platforms: GroupedList<BacktestPlatform>[];

    selectedPairs: SelectedPair[] = [];

    isDrawChart = true;

    minFee = 5;

    constructor(
        private constant: BacktestConstantService,
        private util: UtilService,
    ) { }

    ngOnInit() {
        this.util.getGroupedList(of(this.constant.BACKTEST_PLATFORMS), 'group').subscribe(result => this.platforms = result);
    }

    resetSelectedStock() {
        this.selectedStock = 0;
    }

    addPair(eid: string, stock: string) {
        if (!eid || !stock) return;

        const { name } = this.constant.BACKTEST_PLATFORMS.find(item => item.eid === eid);

        if (!this.selectedPairs.find(item => item.platformId === eid && item.stock === stock)) {
            this.selectedPairs.push({ platformId: eid, stock, platformName: name });
        } else {
            /**
             * do nothing;
             */
        }
    }

    removePair(index: number) {
        this.selectedPairs.splice(index, 1);
    }

    private _selectedPlatform = 'OKCoin_EN';

    get selectedPlatform() {
        return this._selectedPlatform;
    }

    set selectedPlatform(value: string) {
        this._selectedPlatform = value;

        if (value === 'Futures_CTP') {
            this.fixKlinePeriod.emit(this.constant.K_LINE_PERIOD.find(item => item.minutes === 24 * 60).id);
        } else {
            this.fixKlinePeriod.emit(null); // emit null to enable kline period select.
        }
    }

    get platform(): BacktestPlatform {
        return this.constant.BACKTEST_PLATFORMS.find(item => item.eid === this.selectedPlatform);
    }

    get stocks() {
        return this.platform.stocks;
    }

    private _balance: number;

    get balance() {
        return this.platform.balance;
    }

    set balance(value: number) {
        this._balance = value;
    }

    private _currency: number;

    get currency() {
        return this.platform.remainingCurrency;
    }

    set currency(value: number) {
        this._currency = value;
    }

    private _makerFee: number;

    get makerFee() {
        return this.platform.makerFee;
    }

    set makerFee(value: number) {
        this.makerFee = value;
    }

    private _takerFee: number;

    get takerFee() {
        return this.platform.takerFee;
    }

    set takerFee(value: number) {
        this.takerFee = value;
    }
}
