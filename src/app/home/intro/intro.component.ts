import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { BusinessComponent } from '../../interfaces/business.interface';
import { SettingTypes } from './../../interfaces/request.interface';
import { PublicService } from './../../providers/public.service';
import { HomeService } from './../providers/home.service';

@Component({
    selector: 'app-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.scss']
})
export class IntroComponent extends BusinessComponent {

    subscription$$: Subscription;

    constructor(
        private homeService: HomeService,
        private publicService: PublicService,
    ) {
        super();
    }

    ngOnInit() {
        this.launch();
    }

    launch() {
        this.subscription$$ = this.publicService.launchGetSettings(SettingTypes.index, false)
            .add(this.homeService.launchExchangeList())
            .add(this.publicService.handleSettingsError())
            .add(this.homeService.handleExchangeListError());
    }

    initialModel() {
    }

    ngOnDestroy() {

    }

}
