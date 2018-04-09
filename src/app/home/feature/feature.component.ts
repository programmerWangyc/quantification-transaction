import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {
    @Input() featureIcon: string;

    @Input() label: string;

    @Input() keyword: string;

    constructor() { }

    ngOnInit() {
    }
}


export const features = [
    { label: 'INTRO_DESCRIPTION_1', icon: 'visibility', keyword: 'INTRO_DES_KEYWORD_1' },
    { label: 'INTRO_DESCRIPTION_2', icon: 'home', keyword: 'INTRO_DES_KEYWORD_2'},
    { label: 'INTRO_DESCRIPTION_3', icon: 'airplay', keyword: 'INTRO_DES_KEYWORD_3'},
    { label: 'INTRO_DESCRIPTION_4', icon: 'call', keyword: 'INTRO_DES_KEYWORD_4'},
];

@Component({
    selector: 'feature-container',
    template: `
    <div id="feature">
        <div fxLayout="row">
            <app-feature *ngFor="let item of features" [label]="item.label" [featureIcon]="item.icon" [keyword]="item.keyword" fxFlex="25" fxLayoutAlign="start stretch"></app-feature>
        </div>
    </div>
    `,
    styles: ['#feature { padding:30px 10%; min-height: 240px;}']
})
export class FeatureContainerComponent {

    features = features;

    constructor() { }
}