import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { isBoolean, isEmpty, isNull, isNumber, omit } from 'lodash';
import { Observable, of } from 'rxjs';
import { filter, map, startWith, switchMap, switchMapTo, take, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { Exchange, ExchangeMetaData, Platform } from '../../interfaces/response.interface';
import { EncryptService } from '../../providers/encrypt.service';
import { ExchangeService as GlobalExchangeService } from '../../providers/exchange.service';
import { PlatformService } from '../../providers/platform.service';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
import { ExchangeConfig } from '../../store/exchange/exchange.reducer';
import * as fromRoot from '../../store/index.reducer';
import { VerifyPasswordComponent } from '../../tool/verify-password/verify-password.component';
import { ValidatorResult } from '../../validators/validators';
import { ExchangeType } from '../exchange.config';
import { ExchangeConstantService } from './exchange.constant.service';
import { ExchangeService } from './exchange.service';

export type Validator = (input: AbstractControl) => ValidatorResult;

export interface FormOptions {
    value?: any;
    key: string;
    label: string;
    required?: boolean;
    controlType?: string;
    validators?: Validator[];
    encrypt?: boolean;
}

export interface FormedExchange extends Exchange {
    form: FormOptions[];
    meta: ExchangeMetaData[];
}

export class FormBase {
    value: any;
    key: string;
    label: string;
    required: boolean;
    controlType: string;
    disabled: boolean;
    validators: Validator[];
    encrypt: boolean;

    constructor(options: FormOptions) {
        this.value = options.value || '';
        this.key = options.key || '';
        this.label = options.label || '';
        this.required = isBoolean(options.required) ? options.required : true;
        this.controlType = options.controlType || 'text';
        this.validators = options.validators;
        this.encrypt = options.encrypt || false;
    }
}

// flag
const flagKey = 'flag';

export const flag: FormOptions = {
    value: '',
    key: flagKey,
    label: 'FLAG',
    required: true,
    validators: [Validators.required],
};

@Injectable()
export class ExchangeFormService extends BaseService {
    readonly AUTH_CODE_CHECKBOX_KEY = 'needAuth';

    readonly FLAG_KEY = flagKey;

    AUTH_CODE_INPUT_KEY = '';

    validateLength: (input: AbstractControl) => ValidatorResult;

    constructor(
        private store: Store<fromRoot.AppState>,
        private constant: ExchangeConstantService,
        private exchangeService: ExchangeService,
        private translate: TranslateService,
        private publicService: PublicService,
        private globalExchangeService: GlobalExchangeService,
        private platformService: PlatformService,
        private tipService: TipService,
        private encryptService: EncryptService,
    ) {
        super();
    }

    /**
     * Get form group instance by exchange type;
     * @param exchangeType 交易所类型
     */
    getCurrentForm(): Observable<FormGroup> {
        return this.getCurrentFormOptions().pipe(
            map(options => {
                if (!!options) {
                    const group = options.reduce((acc, control) => {
                        acc[control.key] = new FormControl(control.value, control.validators);

                        return acc;
                    }, {});

                    return new FormGroup(group);
                } else {
                    return null;
                }
            })
        );
    }

    /**
     * 获取当前的表单配置项
     */
    getCurrentFormOptions(): Observable<FormBase[]> {
        return this.exchangeService.getExchangeConfig().pipe(
            withLatestFrom(
                this.generateFormedExchange(),
                (config, exchanges) => {
                    const { selectedExchange } = config;

                    return isNull(selectedExchange) ? null : this.getFormBases(config, exchanges);
                }
            )
        );
    }

    /**
     * 生成包含表单信息的交易所数据
     */
    private generateFormedExchange(): Observable<FormedExchange[]> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectExchangeListResponse),
            map(res => res.result.exchanges.map(exchange => {
                const meta = <ExchangeMetaData[]>exchange.meta;

                if (exchange.eid === this.constant.FUTURES_CTP) {
                    return { ...exchange, meta, form: this.getCommonFuturesFormOptions(meta) };
                } else {
                    return { ...exchange, meta, form: this.getFormOptions(meta) };
                }
            }))
        );
    }

    /**
     * Get form base instances
     */
    private getFormBases(config: ExchangeConfig, source: FormedExchange[]): FormBase[] {
        const result: FormedExchange = this.exchangeService.getTargetExchange(config, source);

        const options = [...result.form, { ...flag, label: this.unwrap(this.translate.get(flag.label)) }];

        return options.map(option => {
            const control = this.patchFormValue(option, config);

            return new FormBase(control);
        });
    }

    /**
     * 获取标签默认值
     */
    getDefaultFlagValue(): Observable<string> {
        return this.exchangeService.getExchangeConfig().pipe(
            filter(config => !isNull(config.selectedExchange)),
            withLatestFrom(
                this.publicService.getBrokers(),
                this.globalExchangeService.getExchangeList(),
                this.platformService.getPlatformList().pipe(
                    startWith([])
                ),
                (config, brokers, exchanges, platforms) => {

                    const { selectedExchange, selectedTypeId } = config;

                    if (selectedTypeId === ExchangeType.futures || selectedTypeId === ExchangeType.eSunny) {
                        const target = brokers.find(item => item.brokerId === selectedExchange);

                        return this.addSuffixForFlag(target.name, platforms);
                    } else if (selectedTypeId === ExchangeType.currency) {
                        const key = isNumber(selectedExchange) ? 'id' : 'eid'; // *编辑状态下 platformDetail 返回后，存入 store 的实际是交易所的 eid。

                        const target = exchanges.find(item => item[key] === selectedExchange);

                        return this.addSuffixForFlag(target.name, platforms);
                    } else {
                        return '';
                    }
                })
        );
    }

    /**
     * 给标签的默认值加后缀
     */
    private addSuffixForFlag(name: string, platforms: Platform[]): string {
        if (isEmpty(platforms)) {
            return name;
        } else {
            const count = platforms.reduce((acc, platform) => {
                if (platform.name.includes(name)) acc += 1;

                return acc;
            }, 0);

            return !!count ? name + '-' + count : name;
        }
    }

    /**
     * 普通期货的表表单配置信息
     */
    private getCommonFuturesFormOptions(data: ExchangeMetaData[]): FormOptions[] {
        return data.reduce((acc, cur) => {
            const { name, label, type, length, def, checkbox, encrypt } = cur;

            if (checkbox) {

                // * 这里赋值了两个额外的变量，供组件使用。
                this.validateLength = (input: AbstractControl) => input.value.length === length ? null : { length };

                this.AUTH_CODE_INPUT_KEY = name;

                return [
                    ...acc,
                    { required: false, key: this.AUTH_CODE_CHECKBOX_KEY, label: checkbox, controlType: 'checkbox', value: !!def, validators: null },
                    { required: true, key: name, label, controlType: this.getControlType(type), encrypt, validators: null },
                ];
            } else {
                return [...acc, this.transformMetaDataToFormControl(cur)];
            }
        }, []);
    }

    /**
     * 获取表单配置信息
     */
    private getFormOptions(data: ExchangeMetaData[]): FormOptions[] {
        return data.map(item => this.transformMetaDataToFormControl(item));
    }

    /**
     * 设置表单的默认值
     * @param control 表单控件的原始值
     * @param config 交易所的设置信息
     */
    private patchFormValue(control: FormOptions, config: ExchangeConfig): FormOptions {
        const { selectedExchange, quotaServer, tradeServer } = config;

        const { key, value } = control;

        let currentValue = value;

        switch (key) {
            case 'MDFront':
                currentValue = quotaServer;
                break;
            case 'TDFront':
                currentValue = tradeServer;
                break;
            case 'BrokerId':
                currentValue = (<string>selectedExchange).includes(',') ? (<string>selectedExchange).split(',')[1] : selectedExchange;
                break;
            default:
            // do nothing;
        }

        return { ...control, value: currentValue };
    }

    /**
     * 把 meta 转化成 formControl；
     * @param meta Exchange meta data;
     */
    private transformMetaDataToFormControl(meta: ExchangeMetaData): FormOptions {
        const { name, label, type, required, length, maxlength, def, encrypt } = meta;

        return { required, key: name, label, value: def || '', controlType: this.getControlType(type), validators: this.createValidators(length, maxlength), encrypt };
    }

    /**
     * 生成控件的类型
     */
    private getControlType(type: string): string {
        if (type === 'string') {
            return 'text';
        } else if (type === 'text') {
            return 'textarea';
        } else {
            return type;
        }
    }

    /**
     * 生成验证器
     */
    private createValidators(length: number, maxlength: number): Validator[] {
        const result = [Validators.required];

        const lengthValidator: Validator = (input: AbstractControl) => input.value.length === length ? null : { length };

        const maxLengthValidator: Validator = (input: AbstractControl) => input.value.length <= maxlength ? null : { maxlength };

        if (length) {
            result.push(lengthValidator);
        }

        if (maxlength) {
            result.push(maxLengthValidator);
        }

        return result;
    }

    /**
     * 生成可用于发送请求的配置字符串
     */
    generateConfigString(source: any, group: FormBase[]): Observable<string> {
        return this.isSecurityVerifySuccess().pipe(
            switchMapTo(this.store.pipe(
                select(fromRoot.selectTemporaryPwd),
                map(pwd => Object.keys(source).reduce((acc, key) => {
                    const target = group.find(item => item.key === key);

                    if (target.encrypt) {
                        const prefix = this.constant.ENCRYPT_PREFIX2;

                        acc[key] = prefix + this.encryptService.encryptText(prefix + source[key], pwd);
                    } else {
                        acc[key] = source[key];
                    }

                    return acc;
                }, {})),
                map(config => {
                    const result: any = omit(config, [this.FLAG_KEY, this.AUTH_CODE_CHECKBOX_KEY]);

                    if (config[this.AUTH_CODE_CHECKBOX_KEY] !== undefined) {
                        result.AuthCode = !config[this.AUTH_CODE_CHECKBOX_KEY] ? '' : result.AuthCode;
                    }

                    return JSON.stringify(result);
                })
            )),
            take(1)
        );
    }

    /**
     * 安全验证
     */
    private isSecurityVerifySuccess(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectTemporaryPwd),
            map(pwd => !!pwd),
            switchMap(verified => verified ? of(true) : this.tipService.securityVerify(VerifyPasswordComponent))
        );
    }
}
