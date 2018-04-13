import { Component, OnInit } from '@angular/core';

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
        icon: 'anticon anticon-shopping-cart',
        title: 'STRATEGY_SQUARE',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'anticon anticon-play-circle-o',
        title: 'FACT_FINDER',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'anticon anticon-aliwangwang-o',
        title: 'COMMUNITY',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'anticon anticon-folder',
        title: 'API_DOCUMENTATION',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
    {
        icon: 'anticon anticon-tool',
        title: 'TOOLS',
        subtitle: 'STRATEGY_SUBTITLE',
        list: [{ label: 'GENERAL_STRATEGY', param: '' }, { label: 'COMMODITY_FUTURES', param: '' }, { label: 'STOCK_SECURITY', param: '' }, { label: 'DIGITAL_CURRENCY', param: '' }, { label: 'TEMPLATE_LIBRARY', param: '' }],
        route: 'square'
    },
];

@Component({
    selector: 'app-entrance',
    templateUrl: './entrance.component.html',
    styleUrls: ['./entrance.component.scss']
})
export class EntranceComponent implements OnInit {

    list = list;

    constructor() { }

    ngOnInit() {
    }

    goTo(target: Direct): void {
        console.log(target);
    }

}