import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SettingTypes } from '../../interfaces/request.interface';
import { PublicService } from '../../providers/public.service';


@Component({
    selector: 'app-agreement',
    templateUrl: './agreement.component.html',
    styleUrls: ['./agreement.component.scss']
})
export class AgreementComponent implements OnInit {

    content: Observable<string>;

    pending: Observable<boolean>

    constructor(
        private publicService: PublicService,
    ) {
    }

    ngOnInit() {
        this.content = this.publicService.getSetting(SettingTypes.agreement);

        this.pending = this.publicService.getSettingState(SettingTypes.agreement);
    }
}
