import { Component, OnDestroy, OnInit } from '@angular/core';
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

    language$: Subject<string> = new Subject();

    subscription: Subscription;

    isShow: Observable<boolean>;

    constructor(
        private translate: TranslateService,
        private publicService: PublicService,
    ) { 
    }

    ngOnInit() {
        this.subscription = this.publicService.updateLanguage(this.language$);

        this.isShow = this.publicService.getFooterState();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}