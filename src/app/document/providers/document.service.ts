import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Observable, Subscription } from 'rxjs';
import { map, take, takeWhile } from 'rxjs/operators/';

import { BaseService } from '../../base/base.service';
import { SettingTypes } from '../../interfaces/request.interface';
import { BBSTopicById, GetBBSTopicResponse } from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { PublicService } from '../../providers/public.service';
import * as fromRoot from '../../store/index.reducer';
import { TipService } from '../../providers/tip.service';
import { keepAliveFn } from '../../interfaces/app.interface';

@Injectable()
export class DocumentService extends BaseService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private publicService: PublicService,
        private translate: TranslateService,
        private tipService: TipService,
    ) {
        super();
    }

    launchDocument(): Subscription {
        return this.process.processDocument(
            this.publicService.getSetting(`${SettingTypes.api}_${this.getRequestSuffix()}`).pipe(
                take(1),
                map(res => ({ id: this.pluckDocumentId(res) }))
            )
        );
    }

    private getDocumentResponse(): Observable<GetBBSTopicResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectDocumentResponse)
        );
    }

    /**
     * @ignore
     */
    getDocument(): Observable<BBSTopicById> {
        return this.getDocumentResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    isLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectDocumentUIState),
            map(state => state.loading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    private getRequestSuffix(): string {
        const language = this.translate.getDefaultLang();

        return language === 'zh' ? 'zh_CN' : 'en_US';
    }

    private pluckDocumentId(input: string): number {
        const [id] = input.match(/\d+/);

        return +id;
    }

    handleGetDocumentError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getDocumentResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
