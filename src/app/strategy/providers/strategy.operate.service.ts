import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { NzModalService } from 'ng-zorro-antd';
import { Observable, Subject, Subscription, zip } from 'rxjs';
import { distinctUntilKeyChanged, filter, map, mapTo, switchMap, takeWhile, tap, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { keepAliveFn } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';
import { RequestParams } from '../../store/strategy/strategy.reducer';
import { GenKeyPanelComponent } from '../gen-key-panel/gen-key-panel.component';
import { InnerShareConfirmComponent, InnerShareFormModel } from '../inner-share-confirm/inner-share-confirm.component';
import { ConfirmType, ShareConfirmComponent } from '../share-confirm/share-confirm.component';
import { ShareStrategyStateSnapshot } from '../strategy.interface';

export enum GenKeyType {
    COPY_CODE,
    REGISTER_CODE,
}

@Injectable()
export class StrategyOperateService extends BaseService {

    private genKey$: Subject<[ShareStrategyStateSnapshot, number]> = new Subject();

    constructor(
        private error: ErrorService,
        private nzModal: NzModalService,
        private process: ProcessService,
        private store: Store<fromRoot.AppState>,
        private tip: TipService,
        private translate: TranslateService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * @ignore
     */
    launchShareStrategy(paramsObs: Observable<ShareStrategyStateSnapshot>): Subscription {
        return this.process.processShareStrategy(paramsObs.pipe(
            switchMap(params => this.confirmStrategyShare(params, ShareConfirmComponent).pipe(
                tap(confirmType => (confirmType === ConfirmType.INNER) && this.genKey$.next([params, confirmType])),
                filter(confirmType => confirmType !== ConfirmType.INNER),
                mapTo({ id: params.id, type: params.type })
            ))
        )).add(this.launchGenKey());
    }

    /**
     * @ignore
     */
    private launchGenKey(): Subscription {
        return this.process.processGenKey(this.genKey$.pipe(
            switchMap(([params]) => this.confirmStrategyShare(params, InnerShareConfirmComponent).pipe(
                map((form: InnerShareFormModel) => ({
                    type: params.type === fromReq.StrategyShareType.PUBLISH ? GenKeyType.COPY_CODE : GenKeyType.REGISTER_CODE,
                    strategyId: params.id,
                    days: form.days,
                    concurrent: form.concurrent,
                }))
            ))
        ));
    }

    /**
     * 发起删除策略请求
     */
    launchDeleteStrategy(paramsObs: Observable<fromRes.Strategy>): Subscription {
        return this.process.processDeleteStrategy(paramsObs.pipe(
            switchMap((params: fromRes.Strategy) => this.tip.guardRiskOperate('DELETE_STRATEGY_TIP', { name: params.name }).pipe(
                mapTo({ id: params.id })
            ))
        ));
    }

    /**
     * @ignore
     */
    launchSaveStrategy(paramsObs: Observable<fromReq.SaveStrategyRequest>): Subscription {
        return this.process.processSaveStrategy(
            paramsObs.pipe(
                tap(params => params.name === '' && this.tip.messageError('STRATEGY_NAME_EMPTY_ERROR')),
                filter(params => !!params.name)
            )
        );
    }

    //  =======================================================Date acquisition=======================================================

    /**
     * @ignore
     */
    private getShareStrategyResponse(): Observable<fromRes.ShareStrategyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectShareStrategyResponse)
        );
    }

    remindPublishRobot(keepAlive: keepAliveFn): Subscription {
        return zip(
            this.getShareStrategyResponse().pipe(
                filter(res => res.result)
            ),
            this.getRequestParams().pipe(
                map(res => res.shareStrategy),
                filter(req => req && (req.type === fromReq.StrategyShareType.SELL)),
                distinctUntilKeyChanged('id')
            )
        ).pipe(
            map(([_1, _2]) => true),
            withLatestFrom(this.translate.get(['PUBLISH_STRATEGY_RELATED_ROBOT_TIP', 'I_KNOWN'])),
            takeWhile(keepAlive)
        ).subscribe(([_1, translated]) => this.nzModal.success({ nzContent: translated.PUBLISH_STRATEGY_RELATED_ROBOT_TIP, nzOkText: translated.I_KNOWN }));
    }

    private getGenKeyResponse(): Observable<fromRes.GenKeyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectGenKeyResponse)
        );
    }

    remindStoreGenKeyResult(keepAlive: keepAliveFn): Subscription {
        return this.getGenKeyResponse().pipe(
            this.filterTruth(),
            map(res => res.result),
            withLatestFrom(
                this.getRequestParams().pipe(
                    map(res => res.genKey),
                    filter(req => !!req)
                ),
                this.translate.get(['I_KNOWN', 'COPY_CODE', 'REGISTER_CODE'])
            ),
            takeWhile(keepAlive)
        ).subscribe(([code, { strategyId, type }, label]) => this.nzModal.success({
            nzContent: GenKeyPanelComponent,
            nzComponentParams: { type, strategyId, code },
            nzOkText: label.I_KNOWN,
            nzCancelText: null,
            nzTitle: type === GenKeyType.COPY_CODE ? label.COPY_CODE : label.REGISTER_CODE,
            nzWidth: '30vw',
        }));
    }

    private getDeleteStrategyResponse(): Observable<fromRes.DeleteStrategyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectDeleteStrategyResponse)
        );
    }

    private getSaveStrategyResponse(): Observable<fromRes.SaveStrategyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectSaveStrategyResponse)
        );
    }

    /**
     * store 中的请求参数;
     */
    private getRequestParams(): Observable<RequestParams> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectStrategyRequestParams)
        );
    }

    //  =======================================================Shortcut methods=======================================================

    private confirmStrategyShare(param: ShareStrategyStateSnapshot, component: any): Observable<number | InnerShareFormModel> {
        const { type, currentType } = param;

        const modal = this.nzModal.create({
            nzContent: component,
            nzComponentParams: { targetType: type, currentType },
            nzFooter: null,
        });

        return modal.afterClose.pipe(
            this.filterTruth()
        );
    }

    //  =======================================================Error handler=======================================================

    handleShareStrategyError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getShareStrategyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleGenKeyError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getGenKeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleDeleteStrategyError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getDeleteStrategyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleSaveStrategyError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getSaveStrategyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
