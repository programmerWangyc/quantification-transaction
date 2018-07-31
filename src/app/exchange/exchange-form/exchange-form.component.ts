import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';

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
    @Input() buttonText: string = 'ADD';

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
                const flag = this.accessField('flag');

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
                const checkbox = this.accessField(this.formService.AUTH_CODE_KEY);

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
            const authCode = this.accessField('AuthCode');

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
        return field.key === 'AuthCode' ? this.accessField('needAuth').value : true;
    }

    /**
     * 获取表单配置字符串
     */
    generateConfig(form: any): void {
        this.formService.generateConfigString(form, this.group).pipe(
            map(config => ({ config, flag: this.accessField('flag').value }))
        ).subscribe(data => this.save.next(data)); // ! subscribe(this.save) 这种写法导致save触发 complete 通知，无法再向组件外传输值。
    }

    /**
     * @ignore
     */
    ngOnDestroy(): void {
        this.isAlive = false;

        this.checkbox$$ && this.checkbox$$.unsubscribe();
    }

}
