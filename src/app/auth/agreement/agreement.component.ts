import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { PublicService } from './../../providers/public.service';


@Component({
    selector: 'app-agreement',
    templateUrl: './agreement.component.html',
    styleUrls: ['./agreement.component.scss']
})
export class AgreementComponent implements OnInit {

    content: Observable<string>;

    constructor(
        private publicService: PublicService,
    ) {
    }

    ngOnInit() {
        this.content = this.publicService.getAgreement();
    }
}
