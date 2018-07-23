import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { of } from 'rxjs';

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
    /**
     * Emit the k line period id which want to use;
     */
    @Output() fixKlinePeriod: EventEmitter<number> = new EventEmitter();

    /**
     * Selected stock;
     */
    selectedStock = 0;

    /**
     * Source data of platforms;
     */
    platforms: GroupedList<BacktestPlatform>[];

    /**
     * Selected trade pair;
     */
    selectedPairs: SelectedPair[] = [];

    /**
     * Platform options
     */
    private platformOptions: BacktestSelectedPair[] = [];

    /**
     * Whether draw chart;
     */
    isDrawChart = true;

    /**
     * Min fee.
     */
    minFee = 5;

    /**
     * Whether show help message if has;
     */
    isHelpShow = true;

    constructor(
        private constant: BacktestConstantService,
        private util: UtilService,
        private backtestService: BacktestService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.util.getGroupedList(of(this.constant.BACKTEST_PLATFORMS), 'group').subscribe(result => this.platforms = result);
    }

    /**
     * 重置选中的 stock;
     */
    resetSelectedStock() {
        this.selectedStock = 0;
    }

    /**
     * Add exchange pair;
     * @param eid platform eid;
     * @param stock stock of exchange pairs;
     */
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

    /**
     * 更新 store 中的交易平台选项。
     */
    private updateSnapshot(eid: string, stock: string, name: string, index: number): void {
        let platformSnapshot: BacktestSelectedPair = { eid, name, stock, makerFee: this.makerFee, takerFee: this.takerFee, };

        if (this.selectedPlatform === 'Futures_CTP') {
            platformSnapshot = { ...platformSnapshot, minFee: this.minFee, balance: this.balance };
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

    /**
     * 移除交易对，同时更新 store 中的交易平台选项。
     */
    removePair(index: number) {
        this.selectedPairs.splice(index, 1);

        this.platformOptions.splice(index, 1);

        this.backtestService.updatePlatformOptions(this.platformOptions);
    }

    /**
     * @ignore
     */
    private _selectedPlatform = 'OKCoin_EN';

    /**
     * Get selected platform
     */
    get selectedPlatform() {
        return this._selectedPlatform;
    }

    /**
     * 设置选中的平台，同时通知是否锁定k线周期。
     */
    set selectedPlatform(value: string) {
        this._selectedPlatform = value;

        if (value === 'Futures_CTP') {
            this.fixKlinePeriod.emit(this.constant.K_LINE_PERIOD.find(item => item.minutes === 24 * 60).id);
        } else {
            this.fixKlinePeriod.emit(null); // emit null to enable kline period select.
        }
    }

    /**
     * @ignore
     */
    get platform(): BacktestPlatform {
        return this.constant.BACKTEST_PLATFORMS.find(item => item.eid === this.selectedPlatform);
    }

    /**
     * @ignore
     */
    get stocks() {
        return this.platform.stocks;
    }

    /**
     * @ignore
     */
    private _balance: number;

    /**
     * @ignore
     */
    get balance() {
        return this._balance || this.platform.balance;
    }

    /**
     * @ignore
     */
    set balance(value: number) {
        this._balance = value;
    }

    private _currency: number;

    /**
     * @ignore
     */
    get currency() {
        return this._currency || this.platform.remainingCurrency;
    }

    /**
     * @ignore
     */
    set currency(value: number) {
        this._currency = value;
    }

    private _makerFee: number;

    /**
     * @ignore
     */
    get makerFee() {
        return this._makerFee || this.platform.makerFee;
    }

    /**
     * @ignore
     */
    set makerFee(value: number) {
        this._makerFee = value;
    }

    private _takerFee: number;

    /**
     * @ignore
     */
    get takerFee() {
        return this._takerFee || this.platform.takerFee;
    }

    /**
     * @ignore
     */
    set takerFee(value: number) {
        this._takerFee = value;
    }
}
