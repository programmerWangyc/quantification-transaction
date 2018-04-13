import { Component, OnInit } from '@angular/core';

interface Feature {
    label: string;
    keyword: string;
}

const list: Feature[] = [
    { label: 'INTRO_DESCRIPTION_1',  keyword: 'INTRO_DES_KEYWORD_1' },
    { label: 'INTRO_DESCRIPTION_2',  keyword: 'INTRO_DES_KEYWORD_2' },
    // { label: 'INTRO_DESCRIPTION_3', keyword: 'INTRO_DES_KEYWORD_3' },
    { label: 'INTRO_DESCRIPTION_4',  keyword: 'INTRO_DES_KEYWORD_4' },
];

@Component({
    selector: 'app-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {

    list = list;
    
    constructor() { }

    ngOnInit() {
    }
}