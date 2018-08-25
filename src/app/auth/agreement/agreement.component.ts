import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SettingTypes } from '../../interfaces/request.interface';
import { PublicService } from '../../providers/public.service';
import { mapTo, startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-agreement',
    templateUrl: './agreement.component.html',
    styleUrls: ['./agreement.component.scss'],
})
export class AgreementComponent implements OnInit {

    /**
     * Agreement
     */
    content: Observable<string>;

    /**
     * loading state;
     */
    loading: Observable<boolean>;

    constructor(
        private publicService: PublicService,
    ) {
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.content = this.publicService.getSetting(SettingTypes.agreement);

        this.loading = this.content.pipe(
            mapTo(true),
            startWith(false),
            map(has => !has)
        );
    }
}
