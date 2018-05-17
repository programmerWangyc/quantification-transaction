import 'rxjs/add/operator/concat';

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Highstock from 'highcharts/highstock';
import { cloneDeep, compact, flatten, isArray, isEmpty, isEqual, isNumber, isObject, omit, orderBy, range } from 'lodash';
import { Observable } from 'rxjs/Observable';

import {
    ChartUpdateIndicator,
    StrategyChartData,
    StrategyChartPoint,
    StrategyChartSeriesData,
} from './../interfaces/constant.interface';
import { RobotLogs, StrategyLog } from './../interfaces/response.interface';
import { UtilService } from './util.service';

@Injectable()
export class ChartService {
    typeButtons: Highstock.RangeSelectorButton[];

    TYPE_BUTTON_RANGE = [1, 3, 8];

    constructor(
        private translate: TranslateService,
        private utilService: UtilService,
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

    /**
     * @description Be careful, this function is very very very not pure. It will modify the options parameter in multi way.
     */
    getRobotStrategyLogsOptions(options: any[], logs: StrategyChartData[]): Highcharts.Options[] {
        const seriesSource = orderBy(logs, ['seriesIdx'], ['asc']).map(item => item.data);

        const seriesOrigin = options.map(item => item.series || []).reduce((acc, cur) => [...acc, ...cur], []);

        seriesOrigin.forEach((item, idx) => {
            item.data = item.data || [];

            const newData = seriesSource[idx];

            if (newData) {
                item.data = item.data.concat(newData);
            } else {
                // nothing to do ;
            }
        })

        options.forEach(option => option.plotOptions = { series: { turboThreshold: 0 } })

        return options;
    }

    restoreStrategyChartData(log: StrategyLog): StrategyChartPoint {
        const data = log.data;

        let result = { id: String(log.id), seriesIdx: log.seriesIdx };

        if (isObject(data) && !isArray(data)) return { ...result, ...data };

        if (isNumber(data)) return { ...result, y: data };

        const info = { x: data[0] };

        if (data.length < 5) { // FIXME: magic number 5; why 5?
            return { ...result, ...info, y: data[1] }
        } else {
            return {
                ...result,
                ...info,
                open: data[StrategyChartSeriesData.OPEN],
                close: data[StrategyChartSeriesData.CLOSE],
                high: data[StrategyChartSeriesData.HIGH],
                low: data[StrategyChartSeriesData.LOW]
            };
        }
    }

    /**
     * @returns { boolean } - Indicate the program is completed.
     */
    updateRobotStrategyChartLabel(charts: Highcharts.ChartObject[], automatic: RobotLogs, manual: RobotLogs): ChartUpdateIndicator[] {
        const needUpdate = automatic.chart !== '';

        let updateIndicator: ChartUpdateIndicator[] = null;

        if (needUpdate) {
            const data = JSON.parse(automatic.chart);

            const newChartOptions: Highcharts.Options[] = this.utilService.toArray(data);

            const result = charts.map((chart, index) => {
                const lineUpdated = this.updatePlotLine(chart, newChartOptions[index], index);

                const titleUpdated = this.updateTitle(chart, newChartOptions[index], index);

                return [
                    { chartIndex: index, feedback: 'update plotLine', updated: lineUpdated },
                    { chartIndex: index, feedback: 'update title', updated: titleUpdated },
                ];
            });

            updateIndicator = flatten(result);

        } else {
            // nothing to do 
        }

        return updateIndicator;
    }

    private updateTitle(chart: Highcharts.ChartObject, option: Highcharts.Options, index: number): boolean {
        const { title, subtitle } = option;

        const params = compact([title, subtitle]);

        const needUpdate = isEmpty(params);

        needUpdate && chart.setTitle.apply(chart, params);

        return needUpdate;
    }

    private updatePlotLine(chart: Highcharts.ChartObject, option: Highcharts.Options, index: number): boolean {
        const xAxis = option.xAxis && this.utilService.toArray(option.xAxis)

        const yAxis = option.yAxis && this.utilService.toArray(option.yAxis);

        const update = (key: string) => (item: Highcharts.AxisOptions, index: number) => {
            const newPlotLines = item.plotLines;

            // const oldPlotLines = chart.options[key][index].plotLines;
            const old = chart.options[key][index];

            newPlotLines && old && !isEqual(newPlotLines, old.plotLines) && chart[key][index].update({ plotLines: newPlotLines });
        }

        const needUpdateXAxis = xAxis && chart.xAxis;

        needUpdateXAxis && xAxis.forEach(update('xAxis'));

        const needUpdateYAxis = yAxis && chart.yAxis;

        needUpdateYAxis && yAxis.forEach(update('yAxis'));

        return !!(needUpdateXAxis || needUpdateYAxis);
    }

    updateRobotStrategyChartPoints(charts: Highcharts.ChartObject[], ids: number[]): ChartUpdateIndicator[] {
        const [pre, cur] = ids;

        const needRemove = cur > pre;

        let updateIndicator: ChartUpdateIndicator[] = null;

        needRemove && charts.forEach((chart, idx) => {
            updateIndicator = range(pre, cur).map(id => {
                const point = chart.get(String(id));

                point && point.remove(false);

                return { updated: !!point, feedback: 'point', chartIndex: idx };
            });
        });

        return updateIndicator;
    }

    updateRobotStrategyChartSeries(charts: Highcharts.ChartObject[], data: StrategyLog[], maxPoint: number): ChartUpdateIndicator[] {
        if (isEmpty(data)) return null;

        const maxViewPoint = Math.ceil(maxPoint / charts.length);

        const logs = cloneDeep(data).reverse();

        const slots = charts.map((chart, chartIdx) => chart.series.filter(this.isValidSeries).map((item, seriesIdx) => ({ seriesIdx, chart, chartIdx })))
            .reduce((acc, cur) => [...acc, ...cur], []);

        const updateIndicator: ChartUpdateIndicator[] = logs.map(log => {
            const seriesIdx = log.seriesIdx;

            const target = slots[seriesIdx];

            if (!target) return null;

            const chart = target.chart;

            const data = this.restoreStrategyChartData(log);

            const point = <Highcharts.PointObject>chart.get(String(log.id));

            if (point) {
                point.update(data, false, false);

                return { updated: true, feedback: 'update point', chartIndex: target.chartIdx };
            } else {
                const series = chart.series[target.seriesIdx];

                const needAdd = !this.hasCategories(chart) || chart.options.xAxis[0].categories.length > series.data.length;

                needAdd && series.addPoint(omit(data, 'seriesIdx'), false, series.data.length > maxViewPoint);

                return { updated: needAdd, feedback: 'add point', chartIndex: target.chartIdx };
            }
        });

        return updateIndicator;
    }
    // 这个东西是调试发现的，从ChartObject上取系列时，有导航的图表会多出这么一个系列。
    private isValidSeries(series): boolean {
        return series.name !== 'Navigator 1';
    }

    private hasCategories(chart): boolean {
        const xAxis = chart.xAxis;

        return Array.isArray(xAxis) && !isEmpty(xAxis[0].categories);
    }
}