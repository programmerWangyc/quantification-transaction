import 'rxjs/add/operator/partition';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
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
    ) {
        super(store, error, process, utilService, nzModal, constant);
    }

    /* =======================================================Serve Request======================================================= */

    launchShareStrategy(params: Observable<ShareStrategyStateSnapshot>): Subscription {
        return this.process.processShareStrategy(params.switchMap(params => this.confirmStrategyShare(params, ShareConfirmComponent)
            .do(confirmType => (confirmType === ConfirmType.INNER) && this.genKey$.next([params, confirmType]))
            .filter(confirmType => confirmType !== ConfirmType.INNER)
            .mapTo({ id: params.id, type: params.type }))
        )
            .add(this.launchGenKey());
    }

    launchGenKey(): Subscription {
        return this.process.processGenKey(this.genKey$.switchMap(([params, confirmType]) => this.confirmStrategyShare(params, InnerShareConfirmComponent)
            .map((form: InnerShareFormModel) => ({
                type: params.type === fromReq.StrategyShareType.PUBLISH ? GenKeyType.COPY_CODE : GenKeyType.REGISTER_CODE,
                strategyId: params.id,
                days: form.days,
                concurrent: form.concurrent
            })))
        );
    }

    launchVerifyKey(params: Observable<fromReq.VerifyKeyRequest>): Subscription {
        return this.process.processVerifyKey(params);
    }

    launchDeleteStrategy(params: Observable<fromRes.Strategy>): Subscription {
        return this.process.processDeleteStrategy(params.switchMap(params => this.translate.get('DELETE_STRATEGY_TIP', { name: params.name })
            .mergeMap(content => {
                const modal = this.nzModal.confirm({
                    nzContent: content,
                    nzOnOk: () => modal.close(true),
                })

                return modal.afterClose.do(v => console.log(v)).filter(sure => sure);
            })
            .mapTo({ id: params.id }))
        );
    }

    /* =======================================================Date acquisition======================================================= */

    getShareStrategyResponse(): Observable<fromRes.ShareStrategyResponse> {
        return this.store.select(fromRoot.selectShareStrategyResponse)
            .filter(this.isTruth);
    }

    remindPublishRobot(): Subscription {
        return this.getShareStrategyResponse()
            .filter(res => res.result)
            .zip(this.getRequestParams()
                .map(res => res.shareStrategy)
                .filter(req => req && (req.type === fromReq.StrategyShareType.SELL))
                .distinctUntilKeyChanged('id'),
                (_1, _2) => true
            )
            .withLatestFrom(this.translate.get(['PUBLISH_STRATEGY_RELATED_ROBOT_TIP', 'I_KNOWN']))
            .subscribe(([_1, translated]) => this.nzModal.success({ nzContent: translated.PUBLISH_STRATEGY_RELATED_ROBOT_TIP, nzOkText: translated.I_KNOWN }));
    }

    private getGenKeyResponse(): Observable<fromRes.GenKeyResponse> {
        return this.store.select(fromRoot.selectGenKeyResponse)
            .filter(this.isTruth);
    }

    remindStoreGenKeyResult(): Subscription {
        return this.getGenKeyResponse()
            .filter(res => !!res.result)
            .map(res => res.result)
            .withLatestFrom(this.getRequestParams().map(res => res.genKey).filter(req => !!req), this.translate.get(['I_KNOWN', 'COPY_CODE', 'REGISTER_CODE']))
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
        return this.store.select(fromRoot.selectVerifyKeyResponse)
            .filter(this.isTruth);
    }

    isVerifyKeySuccess(): Observable<boolean> {
        return this.getVerifyKeyResponse()
            .map(res => res.result);
    }

    private getDeleteStrategyResponse(): Observable<fromRes.DeleteStrategyResponse> {
        return this.store.select(fromRoot.selectDeleteStrategyResponse)
            .filter(this.isTruth);
    }

    /* =======================================================Shortcut methods======================================================= */

    private confirmStrategyShare(param: ShareStrategyStateSnapshot, component: any): Observable<number | InnerShareFormModel> {
        const { id, type, currentType } = param;


        const modal = this.nzModal.create({
            nzContent: component,
            nzComponentParams: { targetType: type, currentType },
            nzFooter: null,
        })

        return modal.afterClose.filter(this.isTruth);
    }

    /* =======================================================Error handler======================================================= */

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
}
