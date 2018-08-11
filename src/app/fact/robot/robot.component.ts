import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { isString } from 'lodash';

import { PublicRobot, PublicRobotSummaryTable } from '../../interfaces/response.interface';

@Component({
    selector: 'app-robot',
    templateUrl: './robot.component.html',
    styleUrls: ['./robot.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RobotComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() robots: PublicRobot[];

    constructor(
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }
}

/**
 * *解析summary的基类，提供提取字符串内容的各种方法。
 * *正则在各函数内部实例化，不仅可以保证各个功能函数都是纯函数，而且避免了 exec时 lastIndex的位置不正确的问题，避免重置操作。
 */
export class RobotBase {

    /**
     * @ignore
     */
    protected hasTable(str: string): boolean {
        const tableStartReg = /`[\[\{]{1}/;

        const tableEndReg = /[\]\}]{1}`/g;

        return tableStartReg.test(str) && tableEndReg.test(str);
    }

    /**
     * 提取表格信息
     */
    protected getSummaryContent(str: string): PublicRobotSummaryTable[] {
        const tableStartReg = /`[\[\{]{1}/;

        const tableEndReg = /[\]\}]{1}`/g;

        const startIdx = str.search(tableStartReg);

        const endIdx = this.lastIndex(str, tableEndReg);

        const data = str.substring(startIdx, endIdx).replace(/`/g, '');

        let result = null;

        try {
            const source = JSON.parse(data);

            result = Array.isArray(source) ? source : [source];
        } catch (error) {
            result = this.tryParseJSON(error, data);
        }

        return result;
    }

    /**
     * 分段解析不合法的JSON
     */
    protected tryParseJSON(error: SyntaxError, data: string): any[] {
        let result = [];

        const [position] = (<SyntaxError>error).message.match(/\d+/);

        const ary = [data.substring(0, +position), data.substring(+position)]
            .map(item => {
                try {
                    return JSON.parse(item);
                } catch (error) {
                    return this.tryParseJSON(error, item);
                }
            });

        result = ary.reduce((acc, cur) => Array.isArray(cur) ? [...acc, ...cur] : [...acc, cur], []);

        return result;
    }

    /**
     * 表格底部的信息，包括文字描述及图片
     */
    protected getSummaryInfo(str: string): { res: string; images: string[] } {
        const endReg = /[\]\}]{1}`/g;

        const idx = this.lastIndex(str, endReg);

        const data = str.substring(idx);

        return { res: this.getSummaryExtra(data), images: this.pluckImages(data) };
    }

    /**
     * 表格顶部的信息，文字及描述
     */
    protected getSummaryTitle(str: string): { res: string; images: string[] } {
        const startReg = /`[\[\{]{1}/;

        const idx = str.search(startReg);

        const data = idx < 0 ? str : str.substring(0, idx);

        return { res: this.getSummaryExtra(data), images: this.pluckImages(data) };
    }

    protected getSummaryExtra(str: string): string {
        return str.split(/`data\:image\/.*?`/).filter(item => !!item).join('').trim();
    }

    /**
     * 内容的结束位置
     */
    protected lastIndex(str: string, reg: RegExp): number {
        let index = 0;

        while (true) {
            const res = reg.exec(str);

            if (res) {
                index = res.index;
            } else {
                break;
            }
        }

        return index + 2; // 最的匹配到的应该是 ]`或者}`，加上2个字符就是info开始的位置
    }

    /**
     * 提取图片
     */
    protected pluckImages(str: string): string[] {
        const reg = /`(data\:image\/.*?)`/g;

        const images = [];

        while (true) {
            const res = reg.exec(str);

            if (res) {
                images.push(res[1].trim());
            } else {
                break;
            }
        }

        return !!images.length ? images : null;
    }
}


@Component({
    selector: 'app-robot-subtitle',
    template: `
    <div>
        <ng-container *ngIf="images">
            <img *ngFor="let img of images" [src]="img" style="max-width: 100%;">
        </ng-container>
        <h4 *ngIf="description">{{description}}</h4>
    </div>
    `,
    styleUrls: ['./robot.component.scss'],
})
export class RobotSubtitleComponent extends RobotBase {
    /**
     * @ignore
     */
    @Input() set summary(input: string) {
        if (!input) return;

        const { res, images } = this.getSummaryTitle(input);

        this.description = res;

        this.images = images;
    }

    /**
     * @ignore
     */
    description: string;

    /**
     * @ignore
     */
    images: string[];
}

@Component({
    selector: 'app-robot-inner-table',
    template: `
    <nz-tabset *ngIf="tables.length">
        <nz-tab *ngFor="let table of tables" [nzTitle]="table.title">
            <nz-table [nzData]="table.rows" nzSize="middle" [nzShowPagination]="false">
                <thead>
                    <tr>
                        <th *ngFor="let col of table.cols">{{col}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let row of table.rows">
                        <td *ngFor="let item of row">
                            <ng-container *ngIf="isImage(item) else normalContent">
                                <span [innerHTML]="item | summaryInfo | safeHtml"></span>
                            </ng-container>

                            <ng-template #normalContent>
                                <span [ngStyle]="{color: item | extraColorPicker}">{{item | extraContent | pluckContent}}</span>
                            </ng-template>
                        </td>
                    </tr>
                </tbody>
            </nz-table>
        </nz-tab>
    <nz-tabset>
    `,
    styleUrls: ['./robot.component.scss'],
})
export class RobotInnerTableComponent extends RobotBase {

    /**
     * @ignore
     */
    @Input() set summary(input: string) {
        if (!input || !this.hasTable(input)) return;

        const tables = this.getSummaryContent(input);

        if (tables) this.tables = tables;
    }

    /**
     * @ignore
     */
    tables: PublicRobotSummaryTable[] = [];

    /**
     * @ignore
     */
    isImage(str: any): boolean {
        return isString(str) && str.startsWith('data:image/');
    }
}

@Component({
    selector: 'app-robot-info',
    template: `
    <div class="info">
        <p *ngIf="description">{{description}}</p>
        <ng-container *ngIf="images">
            <img *ngFor="let image of images" [src]="image" style="max-width: 100%;">
        </ng-container>
    </div>
    `,
    styleUrls: ['./robot.component.scss'],
})
export class RobotInfoComponent extends RobotBase {

    /**
     * @ignore
     */
    @Input() set summary(input: string) {
        if (!input) return;

        // 有表格的时候才查找info，否则数据将被当作title处理
        if (this.hasTable(input)) {
            const { res, images } = this.getSummaryInfo(input);

            this.description = res;

            this.images = images;
        }
    }

    /**
     * @ignore
     */
    description: string;

    /**
     * @ignore
     */
    images: string[];
}
