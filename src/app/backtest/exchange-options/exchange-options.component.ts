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

    /**
     * 代码中的设置
     */
    @Input() set config(input: BacktestSelectedPair[]) {
        if (!input) return;

        const source = this.checkSelectedPair(input); // 兼容旧代码

        this.platformOptions = source;

        this.backtestService.updatePlatformOptions(source);

        this.selectedPairs = source.map(item => {
            const { eid, name, stock } = item;

            return { platformId: eid, platformName: name, stock };
        });
    }

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

    /**
     * @ignore
     */
    private _selectedPlatform = 'OKCoin_EN';

    /**
     * @ignore
     */
    private _balance: number;

    /**
     * @ignore
     */
    private _currency: number;

    /**
     * @ignore
     */
    private _makerFee: number;

    /**
     * @ignore
     */
    private _takerFee: number;

    span = 6;

    gutter = 24;

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
     * 检查的粒度可能需要更加细化。出了问题再改吧
     */
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

    /**
     * 移除交易对，同时更新 store 中的交易平台选项。
     */
    removePair(index: number) {
        this.selectedPairs.splice(index, 1);

        this.platformOptions.splice(index, 1);

        this.backtestService.updatePlatformOptions(this.platformOptions);
    }

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
    get balance() {
        return this._balance || this.platform.balance;
    }

    /**
     * @ignore
     */
    set balance(value: number) {
        this._balance = value;
    }

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
