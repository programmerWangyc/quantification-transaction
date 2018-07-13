import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { PublicService } from '../../providers/public.service';

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
