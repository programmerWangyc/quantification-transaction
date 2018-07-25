import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { NzModalRef } from 'ng-zorro-antd';
import { Observable, Subject, Subscription, timer as observableTimer } from 'rxjs';
import { map, switchMapTo, take, tap } from 'rxjs/operators';

import { StrategyOperateService } from '../providers/strategy.operate.service';

@Component({
    selector: 'app-strategy-renewal',
    templateUrl: './strategy-renewal.component.html',
    styleUrls: ['./strategy-renewal.component.scss'],
})
export class StrategyRenewalComponent implements OnInit, OnDestroy {
    @Input() name: string;

    @Input() author: string;

    @Input() email: string;

    @Input() id: number;

    verify: Subject<string> = new Subject();

    code = '';

    subscription$$: Subscription;

    forbidden = false;

    timer: Observable<number>;

    startTimer: Subject<boolean> = new Subject();

    constructor(
        private modalRef: NzModalRef,
        private strategyOperate: StrategyOperateService,
    ) { }

    ngOnInit() {
        this.timer = this.startTimer.pipe(switchMapTo(this.tryAgain(6)));

        this.subscription$$ = this.strategyOperate.launchVerifyKey(this.verify.pipe(
            map(verifyCode => ({ verifyCode, strategyId: this.id }))
        ))
            .add(this.strategyOperate.isVerifyKeySuccess().subscribe(isSuccess => {
                if (isSuccess) {
                    this.close();
                } else {
                    this.startTimer.next(true);
                }
            }))
            .add(this.strategyOperate.handleVerifyKeyError());
    }

    close() {
        this.modalRef.close();
    }

    tryAgain(seconds: number): Observable<number> {
        return observableTimer(0, 1000).pipe(
            take(seconds),
            map(count => seconds - count - 1),
            tap(time => this.forbidden = !!time)
        );
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
