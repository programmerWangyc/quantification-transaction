import { Component, OnInit } from '@angular/core';

interface Feature {
    label: string;
    keyword: string;
    keywordEn: string;
    img: string;
}

const list: Feature[] = [
    { label: 'INTRO_DESCRIPTION_1', keyword: 'INTRO_DES_KEYWORD_1', keywordEn: 'Absorbed', img: '../../../assets/images/home/absorbed.png' },
    { label: 'INTRO_DESCRIPTION_2', keyword: 'INTRO_DES_KEYWORD_2', keywordEn: 'Free', img: '../../../assets/images/home/free.png' },
    { label: 'INTRO_DESCRIPTION_4', keyword: 'INTRO_DES_KEYWORD_4', keywordEn: 'High efficiency', img: '../../../assets/images/home/efficiency.png' },
];

@Component({
    selector: 'app-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss'],
})
export class FeatureComponent implements OnInit {

    list = list;

    constructor() { }

    ngOnInit() {
    }
}
