import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { BaseComponent } from '../../base/base.component';
import { SettingTypes } from '../../interfaces/request.interface';
import { PublicService } from '../../providers/public.service';
import { ExchangeService } from '../../providers/exchange.service';

export interface QQGroup {
    name: string;
    full: boolean;
    id: number;
}

@Component({
    selector: 'app-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.scss'],
})
export class IntroComponent extends BaseComponent {

    subscription$$: Subscription;

    isAlive = true;

    QQGroup: QQGroup[] = [
        { name: 'MAIN_QQ_GROUP', id: 309368835, full: true },
        { name: 'SECONDARY_QQ_GROUP', id: 608262365, full: true },
        { name: 'THIRD_QQ_GROUP', id: 469046711, full: true },
        { name: 'FOURTH_QQ_GROUP', id: 456221748, full: false },
    ];

    constructor(
        private exchangeService: ExchangeService,
        private publicService: PublicService,
    ) {
        super();
    }

    ngOnInit() {
        this.launch();
    }

    launch() {
        const keepAlive = () => this.isAlive;

        this.subscription$$ = this.publicService.launchGetSettings(SettingTypes.index);

        this.exchangeService.launchExchangeList();

        this.publicService.handleSettingsError(keepAlive);

        this.exchangeService.handleExchangeListError(keepAlive);
    }

    initialModel() {
    }

    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }

}
