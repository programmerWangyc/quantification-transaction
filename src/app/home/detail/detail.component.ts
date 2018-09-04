import { Component, OnInit } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

interface Detail {
    title: string;
    detail: SafeHtml;
    src: string;
}

export const list = [
    {
        src: '../../../assets/images/home/coding_online.png',
        title: 'INTRO_DETAIL_TITLE_1',
        detail: 'INTRO_DETAIL_1',
    },
    {
        src: '../../../assets/images/home/cross_platform.png',
        title: 'INTRO_DETAIL_TITLE_2',
        detail: 'INTRO_DETAIL_2',
    },
    {
        src: '../../../assets/images/home/free_flexible.png',
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

    list: Detail[] = list;

    constructor(
    ) { }

    ngOnInit() {
    }
}
