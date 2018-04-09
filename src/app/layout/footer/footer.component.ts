import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { PublicService } from './../../providers/public.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

    selected = 'zh';

    language$: Subject<MatSelectChange> = new Subject();

    subscription: Subscription;

    isShow: Observable<boolean>;

    constructor(
        private translate: TranslateService,
        private publicService: PublicService,
    ) { 
    }

    ngOnInit() {
        this.subscription = this.publicService.updateLanguage(this.language$.do(v=> console.log(v)).map(matSelect => matSelect.value));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
