import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { BaseComponent } from '../../base/base.component';
import { SettingTypes } from '../../interfaces/request.interface';
import { PublicService } from '../../providers/public.service';
import { ExchangeService } from '../../providers/exchange.service';

@Component({
    selector: 'app-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.scss'],
})
export class IntroComponent extends BaseComponent {

    subscription$$: Subscription;

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
        this.subscription$$ = this.publicService.launchGetSettings(SettingTypes.index)
            .add(this.exchangeService.launchExchangeList())
            .add(this.publicService.handleSettingsError())
            .add(this.exchangeService.handleExchangeListError());
    }

    initialModel() {
    }

    ngOnDestroy() {

    }

}
