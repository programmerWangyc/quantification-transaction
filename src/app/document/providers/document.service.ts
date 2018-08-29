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

    //  =======================================================Serve Request=======================================================

    /**
     * @ignore
     */
    launchDocument(): Subscription {
        return this.process.processDocument(
            this.publicService.getSetting(`${SettingTypes.api}_${this.getRequestSuffix()}`).pipe(
                take(1),
                map(res => ({ id: this.pluckDocumentId(res) }))
            )
        );
    }

    //  =======================================================Date acquisition=======================================================

    /**
     * @ignore
     */
    private getDocumentResponse(): Observable<GetBBSTopicResponse> {
        return this.store.pipe(
            select(fromRoot.selectDocumentResponse),
            this.filterTruth()
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

    //  =======================================================Shortcut methods=======================================================

    /**
     * Setting 的api 请求后缀；
     */
    private getRequestSuffix(): string {
        const language = this.translate.getDefaultLang();

        return language === 'zh' ? 'zh_CN' : 'en_US';
    }

    /**
     * 从api setting响应的数据中提取 document 的 id;
     */
    private pluckDocumentId(input: string): number {
        const [id] = input.match(/\d+/);

        return +id;
    }

    //  =======================================================Local state change=======================================================
    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleGetDocumentError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getDocumentResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
