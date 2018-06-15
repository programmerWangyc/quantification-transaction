import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { of } from 'rxjs/observable/of';

import { SelectedPair } from '../../interfaces/app.interface';
import { GroupedList, UtilService } from '../../providers/util.service';
import { BacktestPlatform, BacktestSelectedPair } from '../backtest.interface';
import { BacktestConstantService } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

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

    platformOptions: BacktestSelectedPair[] = [];

    isDrawChart = true;

    minFee = 5;

    isHelpShow = true;

    constructor(
        private constant: BacktestConstantService,
        private util: UtilService,
        private backtestService: BacktestService,
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

        const index = this.selectedPairs.findIndex(item => item.platformId === eid && item.stock === stock);

        if (index < 0) {
            this.selectedPairs.push({ platformId: eid, stock, platformName: name });
        } else {
            /**
             * do nothing;
             */
        }

        this.updateSnapshot(eid, stock, name, index);
    }

    updateSnapshot(eid: string, stock: string, name: string, index: number): void {
        let platformSnapshot: BacktestSelectedPair = { eid, name, stock, makerFee: this.makerFee, takerFee: this.takerFee, };

        if (this.selectedPlatform === 'Futures_CTP') {
            platformSnapshot = { ...platformSnapshot, minFee: this.minFee };
        } else if (this.selectedPlatform === 'Futures_OKCoin') {
            platformSnapshot = { ...platformSnapshot, remainingCurrency: this.currency };
        } else {
            platformSnapshot = { ...platformSnapshot, balance: this.balance, remainingCurrency: this.currency }
        }

        if (index < 0) {
            this.platformOptions.push(platformSnapshot);
        } else {
            this.platformOptions[index] = platformSnapshot;
        }

        this.backtestService.updatePlatformOptions(this.platformOptions);
    }

    removePair(index: number) {
        this.selectedPairs.splice(index, 1);

        this.platformOptions.splice(index, 1);

        this.backtestService.updatePlatformOptions(this.platformOptions);
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
        return this._balance || this.platform.balance;
    }

    set balance(value: number) {
        this._balance = value;
    }

    private _currency: number;

    get currency() {
        return this._currency || this.platform.remainingCurrency;
    }

    set currency(value: number) {
        this._currency = value;
    }

    private _makerFee: number;

    get makerFee() {
        return this._makerFee || this.platform.makerFee;
    }

    set makerFee(value: number) {
        this._makerFee = value;
    }

    private _takerFee: number;

    get takerFee() {
        return this._takerFee || this.platform.takerFee;
    }

    set takerFee(value: number) {
        this._takerFee = value;
    }
}
