import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SettingTypes } from '../interfaces/request.interface';
import { IndexSetting, Partner } from '../interfaces/response.interface';
import { PublicService } from '../providers/public.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {

    partner: Observable<Partner[]>;

    constructor(
        private publicService: PublicService,
    ) { }

    ngOnInit() {
        this.partner = this.publicService.getSetting(SettingTypes.index).pipe(
            map(res => {
                const result = <IndexSetting>JSON.parse(res);

                return result.links;
            })
        );

        this.publicService.toggleFooter();
    }

    ngOnDestroy() {
        this.publicService.toggleFooter();
    }

}
