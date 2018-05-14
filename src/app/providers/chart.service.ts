import 'rxjs/add/operator/concat';

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Highstock from 'highcharts/highstock';
import { Observable } from 'rxjs/Observable';

import { StrategyChartData } from './../interfaces/constant.interface';

@Injectable()
export class ChartService {
    typeButtons: Highstock.RangeSelectorButton[];

    TYPE_BUTTON_RANGE = [1, 3, 8];

    constructor(
        private translate: TranslateService,
    ) {
        this.initialConfig();
    }

    initialConfig() {

        this.setDefaultOptions();

        Observable.from(this.TYPE_BUTTON_RANGE)
            .mergeMap(count => this.translate.get('SOME_HOURS', { count }).map(text => ({ type: 'hour', count, text })))
            .concat(this.translate.get('ALL').map(text => ({ type: 'all', text }))).reduce((acc, cur) => [...acc, cur], [])
            .subscribe(result => this.typeButtons = result);
    }

    /**
     * @description Set highstock global configuration;
     */
    setDefaultOptions() {

        const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]

        const weeks = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

        const other = ["CONTEXT_BUTTON_TITLE", "DOWNLOAD_JPEG", "DOWNLOAD_PDF", "DOWNLOAD_PNG", "DOWNLOAD_SVG", "DRILL_UP_TEXT", "LOADING", "NO_DATA", "PRINT_CHART", "RESET_ZOOM", "RESET_ZOOM_TITLE", "RANGE"];

        this.translate.get(months)
            .map(result => months.map(key => result[key]))
            .zip(
                this.translate.get(weeks).map(result => weeks.map(key => result[key])),
                this.translate.get(other),
                (months, weeks, other) => ({
                    contextButtonTitle: other.CONTEXT_BUTTON_TITLE,
                    downloadJPEG: other.DOWNLOAD_JPEG,
                    downloadPDF: other.DOWNLOAD_PDF,
                    downloadPNG: other.DOWNLOAD_PNG,
                    downloadSVG: other.DOWNLOAD_SVG,
                    drillUpText: other.DRILL_UP_TEXT,
                    loading: other.LOADING,
                    noData: other.NO_DATA,
                    printChart: other.PRINT_CHART,
                    resetZoom: other.RESET_ZOOM,
                    resetZoomTitle: other.RESET_ZOOM_TITLE,
                    shortMonths: months,
                    months: months,
                    weekdays: weeks,
                    rangeSelectorZoom: other.RANGE
                })
            ).subscribe(lang => Highstock.setOptions({ lang, credits: { enabled: false }, global: { useUTC: false } }));
    }

    getRobotProfitLogsOptions(data: [number, number][]): Highstock.Options {
        let seriesName = ''

        this.translate.get('ACCUMULATE_PROFIT').subscribe(result => seriesName = result);

        return {
            plotOptions: {
                series: {
                    turboThreshold: 0 // 禁用涡轮增压
                }
            },
            rangeSelector: {
                buttons: this.typeButtons,
                selected: this.typeButtons.length - 1,
                inputDateFormat: "%Y-%m-%d",
            },
            xAxis: {
                type: 'datetime'
            },
            series: [{
                name: seriesName,
                data: data,
                id: 'primary',
                tooltip: {
                    valueDecimals: 8,
                    xDateFormat: '%Y-%m-%d %H:%M:%S',
                },
                yAxis: 0,
            }],
        };
    }

    getRobotStrategyLogsOptions(options: any[], logs: StrategyChartData[]): Highcharts.Options[] {
        return options.map(option => {
            let series = option.series || [];

            option.series = series.map((item, index) => {
                if (!!item.data) item.data = [];

                const other = logs.find(item => item.seriesIdx === index)

                if (other) item.data = [...item.data, ...other.data];

                return item;
            });

            option.plotOptions = { series: { turboThreshold: 0 } };

            return option;
        })
    }
}