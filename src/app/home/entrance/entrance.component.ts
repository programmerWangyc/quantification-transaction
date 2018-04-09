import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-entrance',
    templateUrl: './entrance.component.html',
    styleUrls: ['./entrance.component.scss']
})
export class EntranceComponent implements OnInit {

    @Input() entrance: Entrance;
    
    constructor() { }

    ngOnInit() {
    }

    goTo(target: Direct): void {
        console.log(target);
    }

}

interface Entrance {
    icon: string;
    title: string;
    subtitle: string;
    list: Direct[];
    route: string;
}

interface Direct {
    label: string;
    param: string;
}

export const list: Entrance[] = [
    {
        icon: 'shopping cart',
        title: 'STRATEGY_SQUARE',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'play_circle_filled',
        title: 'FACT_FINDER',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'chat',
        title: 'COMMUNITY',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'folder',
        title: 'API_DOCUMENTATION',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'build',
        title: 'TOOLS',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
];

@Component({
    selector: 'entrance-container',
    template: `
    <div id="entrance">
        <h2 bt-text-center>{{'INTRO_ENTRANCE_TITLE' | translate}}</h2>
        <mat-grid-list cols="3">
            <mat-grid-tile *ngFor="let item of list" style="padding:10px">
                <app-entrance [entrance]="item"></app-entrance>
            </mat-grid-tile>
        </mat-grid-list>
    </div>
    `,
    styles: ['#entrance {padding: 50px 10%; background: #fff;}']
})
export class EntranceContainerComponent implements OnInit {
    list = list;
    
    constructor() { }

    ngOnInit() { }
}