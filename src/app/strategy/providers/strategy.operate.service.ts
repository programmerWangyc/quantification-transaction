import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { Observable, Subject, Subscription, zip } from 'rxjs';
import { distinctUntilKeyChanged, filter, map, mapTo, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import { UtilService } from '../../providers/util.service';
import * as fromRoot from '../../store/index.reducer';
import { GenKeyPanelComponent } from '../gen-key-panel/gen-key-panel.component';
import { InnerShareConfirmComponent, InnerShareFormModel } from '../inner-share-confirm/inner-share-confirm.component';
import { ConfirmType, ShareConfirmComponent } from '../share-confirm/share-confirm.component';
import { ShareStrategyStateSnapshot } from '../strategy.interface';
import { StrategyConstantService } from './strategy.constant.service';
import { StrategyService } from './strategy.service';



export enum GenKeyType {
    COPY_CODE,
    REGISTER_CODE,
}

@Injectable()
export class StrategyOperateService extends StrategyService {
    private genKey$: Subject<[ShareStrategyStateSnapshot, number]> = new Subject();

    constructor(
        public store: Store<fromRoot.AppState>,
        public error: ErrorService,
        public process: ProcessService,
        public utilService: UtilService,
        public nzModal: NzModalService,
        public translate: TranslateService,
        public constant: StrategyConstantService,
        public tip: TipService,
    ) {
        super(store, error, process, utilService, nzModal, constant, translate);
    }

    //  =======================================================Serve Request=======================================================

    launchShareStrategy(params: Observable<ShareStrategyStateSnapshot>): Subscription {
        return this.process.processShareStrategy(params.pipe(
            switchMap(params => this.confirmStrategyShare(params, ShareConfirmComponent).pipe(
                tap(confirmType => (confirmType === ConfirmType.INNER) && this.genKey$.next([params, confirmType])),
                filter(confirmType => confirmType !== ConfirmType.INNER),
                mapTo({ id: params.id, type: params.type })
            )
            )
        )
        )
            .add(this.launchGenKey());
    }

    launchGenKey(): Subscription {
        return this.process.processGenKey(this.genKey$.pipe(
            switchMap(([params, confirmType]) => this.confirmStrategyShare(params, InnerShareConfirmComponent).pipe(
                map((form: InnerShareFormModel) => ({
                    type: params.type === fromReq.StrategyShareType.PUBLISH ? GenKeyType.COPY_CODE : GenKeyType.REGISTER_CODE,
                    strategyId: params.id,
                    days: form.days,
                    concurrent: form.concurrent
                }))
            )
            )
        )
        );
    }

    launchVerifyKey(params: Observable<fromReq.VerifyKeyRequest>): Subscription {
        return this.process.processVerifyKey(params);
    }

    launchDeleteStrategy(params: Observable<fromRes.Strategy>): Subscription {
        return this.process.processDeleteStrategy(params.pipe(
            switchMap((params: fromRes.Strategy) => this.translate.get('DELETE_STRATEGY_TIP', { name: params.name }).pipe(
                mergeMap(content => {
                    const modal: NzModalRef = this.nzModal.confirm({
                        nzContent: content,
                        nzOnOk: () => modal.close(true),
                    })

                    return modal.afterClose.pipe(
                        this.filterTruth()
                    );
                }),
                mapTo({ id: params.id })
            )
            )
        )
        );
    }

    launchSaveStrategy(params: Observable<fromReq.SaveStrategyRequest>): Subscription {
        return this.process.processSaveStrategy(
            params.pipe(
                tap(params => params.name === '' && this.tip.messageError('STRATEGY_NAME_EMPTY_ERROR')),
                filter(params => !!params.name)
            )
        );
    }

    //  =======================================================Date acquisition=======================================================

    getShareStrategyResponse(): Observable<fromRes.ShareStrategyResponse> {
        return this.store.select(fromRoot.selectShareStrategyResponse).pipe(
            this.filterTruth()
        );
    }

    remindPublishRobot(): Subscription {
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
            withLatestFrom(this.translate.get(['PUBLISH_STRATEGY_RELATED_ROBOT_TIP', 'I_KNOWN']))
        )
            .subscribe(([_1, translated]) => this.nzModal.success({ nzContent: translated.PUBLISH_STRATEGY_RELATED_ROBOT_TIP, nzOkText: translated.I_KNOWN }));
    }

    private getGenKeyResponse(): Observable<fromRes.GenKeyResponse> {
        return this.store.select(fromRoot.selectGenKeyResponse).pipe(
            this.filterTruth()
        );
    }

    remindStoreGenKeyResult(): Subscription {
        return this.getGenKeyResponse().pipe(
            filter(res => !!res.result),
            map(res => res.result),
            withLatestFrom(
                this.getRequestParams().pipe(
                    map(res => res.genKey),
                    filter(req => !!req)
                ),
                this.translate.get(['I_KNOWN', 'COPY_CODE', 'REGISTER_CODE'])
            )
        )
            .subscribe(([code, req, label]) => {
                const { strategyId, type } = req;

                this.nzModal.success({
                    nzContent: GenKeyPanelComponent,
                    nzComponentParams: { type, strategyId, code },
                    nzOkText: label.I_KNOWN,
                    nzCancelText: null,
                    nzTitle: type === GenKeyType.COPY_CODE ? label.COPY_CODE : label.REGISTER_CODE,
                    nzWidth: '30vw'
                })
            });
    }

    private getVerifyKeyResponse(): Observable<fromRes.VerifyKeyResponse> {
        return this.store.select(fromRoot.selectVerifyKeyResponse).pipe(
            this.filterTruth()
        );
    }

    isVerifyKeySuccess(): Observable<boolean> {
        return this.getVerifyKeyResponse().pipe(
            map(res => res.result)
        );
    }

    private getDeleteStrategyResponse(): Observable<fromRes.DeleteStrategyResponse> {
        return this.store.select(fromRoot.selectDeleteStrategyResponse).pipe(
            this.filterTruth()
        );
    }

    private getSaveStrategyResponse(): Observable<fromRes.SaveStrategyResponse> {
        return this.store.select(fromRoot.selectSaveStrategyResponse).pipe(
            this.filterTruth()
        );
    }

    //  =======================================================Shortcut methods=======================================================

    private confirmStrategyShare(param: ShareStrategyStateSnapshot, component: any): Observable<number | InnerShareFormModel> {
        const { id, type, currentType } = param;


        const modal = this.nzModal.create({
            nzContent: component,
            nzComponentParams: { targetType: type, currentType },
            nzFooter: null,
        })

        return modal.afterClose.pipe(
            this.filterTruth()
        );
    }

    //  =======================================================Error handler=======================================================

    handleShareStrategyError(): Subscription {
        return this.error.handleResponseError(this.getShareStrategyResponse())
    }

    handleGenKeyError(): Subscription {
        return this.error.handleResponseError(this.getGenKeyResponse());
    }

    handleVerifyKeyError(): Subscription {
        return this.error.handleResponseError(this.getVerifyKeyResponse());
    }

    handleDeleteStrategyError(): Subscription {
        return this.error.handleResponseError(this.getDeleteStrategyResponse());
    }

    handleSaveStrategyError(): Subscription {
        return this.error.handleResponseError(this.getSaveStrategyResponse());
    }
}
