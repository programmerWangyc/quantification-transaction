import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { NzModalRef } from 'ng-zorro-antd';
import { Observable, Subject, timer as observableTimer } from 'rxjs';
import { map, switchMapTo, take, takeWhile, tap } from 'rxjs/operators';

import { PublicService } from '../../providers/public.service';

@Component({
    selector: 'app-strategy-renewal',
    templateUrl: './strategy-renewal.component.html',
    styleUrls: ['./strategy-renewal.component.scss'],
})
export class StrategyRenewalComponent implements OnInit, OnDestroy {

    /**
     * 策略名称
     */
    @Input() name: string;

    /**
     * 策略作者
     */
    @Input() author: string;

    /**
     * 作者邮箱
     */
    @Input() email: string;

    /**
     * 策略 id
     */
    @Input() id: number;

    /**
     * 提交按钮，验证用户输入的code。
     */
    verify: Subject<string> = new Subject();

    /**
     * 购买码，用户输入的。
     */
    code = '';

    /**
     * 是否禁用提交按钮
     */
    forbidden = false;

    /**
     * 计时器
     */
    timer: Observable<number>;

    /**
     * 打开计时器的流
     */
    private startTimer: Subject<boolean> = new Subject();

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private modalRef: NzModalRef,
        private publicService: PublicService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.timer = this.startTimer.pipe(switchMapTo(this.tryAgain(6)));

        const keepAlive = () => this.isAlive;

        this.publicService.launchVerifyKey(this.verify.pipe(
            map(verifyCode => ({ verifyCode, strategyId: this.id })),
            takeWhile(keepAlive)
        ));

        this.publicService.isVerifyKeySuccess(keepAlive)
            .subscribe(isSuccess => {
                if (isSuccess) {
                    this.close();
                } else {
                    this.startTimer.next(true);
                }
            });

        this.publicService.handleVerifyKeyError(keepAlive);
    }

    /**
     * @ignore
     */
    close() {
        this.modalRef.close();
    }

    /**
     * 重试计时器
     * @param seconds 重试等待秒数
     */
    private tryAgain(seconds: number): Observable<number> {
        return observableTimer(0, 1000).pipe(
            take(seconds),
            map(count => seconds - count - 1),
            tap(time => this.forbidden = !!time)
        );
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
