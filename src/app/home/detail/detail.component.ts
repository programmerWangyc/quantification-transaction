import 'rxjs/add/observable/from';
import 'rxjs/add/operator/reduce';

import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

    @Input() imageAddress: string;

    @Input() title: string;

    @Input() detail: SafeHtml;

    constructor() { }

    ngOnInit() { }

}

export const list = [
    {
        src: '../../../assets/images/just-code.png',
        title: 'INTRO_DETAIL_TITLE_1',
        detail: 'INTRO_DETAIL_1',
    },
    {
        src: '../../../assets/images/future.png',
        title: 'INTRO_DETAIL_TITLE_2',
        detail: 'INTRO_DETAIL_2',
    },
    {
        src: '../../../assets/images/analytics.png',
        title: 'INTRO_DETAIL_TITLE_3',
        detail: 'INTRO_DETAIL_3',
    }
];

interface Detail {
    title: string;
    detail: SafeHtml;
    src: string;
}

@Component({
    selector: 'detail-container',
    template: `
    <div id="detail">
        <h2 bt-text-center>{{'INTRO_DETAIL_TITLE' | translate}}</h2>
        <div fxLayout="row no-wrap" fxLayoutAlign="space-between center">
            <app-detail *ngFor="let item of list | async" [imageAddress]="item.src" [title]="item.title" [detail]="item.detail"></app-detail>
        </div>
        <div class="border"></div>
    </div>`,
    styles: ['#detail{ padding: 50px 10%; background: #fff;}']
})
export class DetailContainerComponent implements OnInit {
    list: Observable<Detail[]>;

    constructor(
        private translate: TranslateService,
        private sanitizer: DomSanitizer,
    ) { }

    ngOnInit() {
        this.list = Observable.from(list)
            .mergeMap(item => this.translate.get(item.detail)
                .map(str => ({ ...item, detail: this.sanitizer.bypassSecurityTrustHtml(str) }))
            )
            .reduce((acc, cur) => {
                acc.push(cur);

                return acc;
            }, []);
    }
}