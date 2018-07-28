import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { from as observableFrom, Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

interface Detail {
    title: string;
    detail: SafeHtml;
    src: string;
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
    },
];

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {

    list: Observable<Detail[]>;

    constructor(
        private translate: TranslateService,
        private sanitizer: DomSanitizer,
    ) { }

    ngOnInit() {
        this.list = observableFrom(list).pipe(
            mergeMap(item => this.translate.get(item.detail).pipe(
                map(str => ({ ...item, detail: this.sanitizer.bypassSecurityTrustHtml(str) }))
            )
            ),
            reduce((acc, cur) => {
                acc.push(cur);

                return acc;
            }, [])
        );
    }
}
