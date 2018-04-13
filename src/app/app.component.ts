import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PublicService } from './providers/public.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    subscription$$: Subscription;

    // needFooter: Observable<boolean>;

    // showFooter = false;

    constructor(
        private translate: TranslateService,
        private pubService: PublicService,
    ) { }

    ngOnInit() {
        this.initLanguage();

        this.subscription$$ = this.pubService.updateInformation()
            .add(this.pubService.getLanguage().subscribe(lang => this.translate.use(lang)))
            .add(this.pubService.saveReferrer());

        // this.pubService.getFooterState().subscribe(pre => this.showFooter = pre);
    }

    initLanguage(): void {
        this.translate.setDefaultLang('zh');

        const actualLanguage = this.translate.getBrowserLang() || 'zh';

        this.translate.use(actualLanguage);
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
