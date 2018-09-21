import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';

import { of } from 'rxjs';

import { SelectedPair } from '../../interfaces/app.interface';
import { GroupedList, UtilService } from '../../providers/util.service';
import { BacktestPlatform, BacktestSelectedPair } from '../backtest.interface';
import { BacktestConstantService } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-exchange-options',
    templateUrl: './exchange-options.component.html',
    styleUrls: ['./exchange-options.component.scss'],
})
export class ExchangeOptionsComponent implements OnInit {

    @Input() set config(input: BacktestSelectedPair[]) {
        if (!input) return;

        const source = this.checkSelectedPair(input);

        this.platformOptions = source;

        this.backtestService.updatePlatformOptions(source);

        this.selectedPairs = source.map(item => {
            const { eid, name, stock } = item;

            return { platformId: eid, platformName: name, stock };
        });
    }
    @Output() fixKlinePeriod: EventEmitter<number> = new EventEmitter();

    selectedStock = 0;

    platforms: GroupedList<BacktestPlatform>[];

    selectedPairs: SelectedPair[] = [];

    private platformOptions: BacktestSelectedPair[] = [];

    isDrawChart = true;

    minFee = 5;

    isHelpShow = true;

    private _selectedPlatform = 'OKCoin_EN';

    private _balance: number;

    private _currency: number;

    private _makerFee: number;

    private _takerFee: number;

    span = 6;

    gutter = 24;

    constructor(
        private constant: BacktestConstantService,
        private util: UtilService,
        private backtestService: BacktestService,
    ) { }

    ngOnInit() {
        this.util.getGroupedList(of(this.constant.BACKTEST_PLATFORMS), 'group').subscribe(result => this.platforms = result);
    }

    private checkSelectedPair(source: BacktestSelectedPair[]): BacktestSelectedPair[] {
        const isBacktestSelectedPair = source.every(item => !item['currency']); // 原代码可能是eid 和 currency, fee?, balance?, currency?, stocks?

        if (isBacktestSelectedPair) {
            return source;
        } else {
            return source.map(item => ({
                eid: item.eid,
                name: item.eid,
                makerFee: item['fee'] && item['fee'][0] || this.makerFee,
                stock: item['currency'],
                takerFee: item['fee'] && item['fee'][1] || this.takerFee,
                balance: item['balance'] || this.balance,
                remainCurrency: item['stocks'] || this.currency,
            }));
        }
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
        }

        this.updateSnapshot(eid, stock, name, index);
    }

    private updateSnapshot(eid: string, stock: string, name: string, index: number): void {
        let platformSnapshot: BacktestSelectedPair = { eid, name, stock, makerFee: this.makerFee, takerFee: this.takerFee };

        if (this.selectedPlatform === 'Futures_CTP') {
            platformSnapshot = { ...platformSnapshot, minFee: this.minFee, balance: this.balance };
        } else if (this.selectedPlatform === 'Futures_OKCoin') {
            platformSnapshot = { ...platformSnapshot, remainingCurrency: this.currency };
        } else {
            platformSnapshot = { ...platformSnapshot, balance: this.balance, remainingCurrency: this.currency };
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

    get balance() {
        return this._balance || this.platform.balance;
    }

    set balance(value: number) {
        this._balance = value;
    }

    get currency() {
        return this._currency || this.platform.remainingCurrency;
    }

    set currency(value: number) {
        this._currency = value;
    }

    get makerFee() {
        return this._makerFee || this.platform.makerFee;
    }

    set makerFee(value: number) {
        this._makerFee = value;
    }

    get takerFee() {
        return this._takerFee || this.platform.takerFee;
    }

    set takerFee(value: number) {
        this._takerFee = value;
    }
}
