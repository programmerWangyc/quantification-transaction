import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';

import { isNumber } from 'lodash';
import { combineLatest, Subscription } from 'rxjs';
import { map, takeWhile, take } from 'rxjs/operators';

import { PlatformAccessKey } from '../../interfaces/response.interface';
import { PlatformService } from '../../providers/platform.service';
import { ExchangeFormService, FormBase } from '../providers/exchange.form.service';

export interface ExchangeFormConfigInfo {
    config: string;
    flag: string;
}

@Component({
    selector: 'app-exchange-form',
    templateUrl: './exchange-form.component.html',
    styleUrls: ['./exchange-form.component.scss'],
})
export class ExchangeFormComponent implements OnInit, OnDestroy {

    /**
     * 是否编辑交易所
     */
    @Input() set frozen(input: number) {
        if (isNumber(input)) {
            this.isEdit = true;

            this.patchValue();
        }
    }

    /**
     * 是否编辑交易所
     */
    isEdit = false;

    /**
     * @ignore
     */
    form: FormGroup;

    /**
     * 生成表单时的原始数据
     */
    group: FormBase[];

    /**
     * 提交按钮
     */
    @Output() save: EventEmitter<ExchangeFormConfigInfo> = new EventEmitter();

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    checkbox$$: Subscription;

    constructor(
        private formService: ExchangeFormService,
        private platform: PlatformService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initForm();

        this.formService.getDefaultFlagValue().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(name => {
            if (this.form) {
                const flag = this.accessField(this.formService.FLAG_KEY);

                flag.patchValue(name);
            }
        });
    }

    /**
     * 生成表单
     */
    private initForm(): void {
        this.formService.getCurrentFormOptions().pipe(
            takeWhile(() => this.isAlive),
        ).subscribe(group => this.group = group);

        this.formService.getCurrentForm().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(form => {
            this.form = form;

            if (this.checkbox$$) this.checkbox$$.unsubscribe();

            if (this.form) {
                const checkbox = this.accessField(this.formService.AUTH_CODE_CHECKBOX_KEY);

                if (!!checkbox) {
                    this.checkbox$$ = this.monitorAuthCode(checkbox);
                }
            }
        });
    }

    /**
     * 监控终端认证码
     * @param control 表单控件
     */
    monitorAuthCode(control: AbstractControl): Subscription {
        return control.valueChanges.subscribe(checked => {
            const authCode = this.accessField(this.formService.AUTH_CODE_INPUT_KEY);

            if (checked) {
                authCode.setValidators([Validators.required, this.formService.validateLength]);
            } else {
                authCode.setValidators(null);
            }

            authCode.updateValueAndValidity();
        });
    }

    /**
     * 访问表单字段的快捷方式
     */
    accessField(key: string): AbstractControl {
        return this.form.get(key);
    }

    /**
     * 获取错误信息的参数
     */
    getTipParams(label: string, other?: { [key: string]: any }): object {
        return other ? { label, ...other } : { label };
    }

    /**
     * 是否需要显示指定的表单控件；目前只有终端认证码需要动态控制显示与隐藏；
     * @param field 表单控件的基础数据
     */
    isControlShow(field: FormBase): boolean {
        return field.key === this.formService.AUTH_CODE_INPUT_KEY ? this.accessField(this.formService.AUTH_CODE_CHECKBOX_KEY).value : true;
    }

    /**
     * 获取表单配置字符串
     */
    generateConfig(form: any): void {
        this.formService.generateConfigString(form, this.group).pipe(
            map(config => ({ config, flag: this.accessField(this.formService.FLAG_KEY).value }))
        ).subscribe(data => this.save.next(data)); // ! subscribe(this.save) 这种写法导致save触发 complete 通知，无法再向组件外传输值。
    }

    /**
     * 编辑状态下设置表单的值
     */
    private patchValue(): void {
        combineLatest(
            this.platform.getPlatformDetail(),
            this.formService.getCurrentForm().pipe(
                take(1)
            )
        ).pipe(
            takeWhile(() => this.isAlive),
            map(([detail, _]) => detail)
        ).subscribe(detail => {
            const { access_key, label } = detail;

            const access = JSON.parse(access_key) as PlatformAccessKey;

            this.accessField(this.formService.FLAG_KEY).patchValue(label);

            Object.entries(access).forEach(([key, value]) => {
                const control = this.accessField(key);

                control && control.patchValue(value);
            });
        });
    }

    /**
     * @ignore
     */
    ngOnDestroy(): void {
        this.isAlive = false;

        this.checkbox$$ && this.checkbox$$.unsubscribe();
    }

}
