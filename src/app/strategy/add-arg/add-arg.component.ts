import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Subscription } from 'rxjs';

import { VariableType } from '../../app.config';
import { VariableTypeDes } from '../../interfaces/app.interface';
import { selectTypeValueValidator, variableNameValidator } from '../../validators/validators';
import { StrategyConstantService } from '../providers/strategy.constant.service';

export interface StrategyMetaArg {
    name: string;
    des: string;
    comment: string;
    type: number;
    defaultValue: any;
    _defaultValue?: any;
}

@Component({
    selector: 'app-add-arg',
    templateUrl: './add-arg.component.html',
    styleUrls: ['./add-arg.component.scss'],
})
export class AddArgComponent implements OnInit, OnDestroy {

    /**
     * 是否交互参数
     */
    @Input() isAlternation = false;

    /**
     * 添加参数
     */
    @Output() add: EventEmitter<StrategyMetaArg> = new EventEmitter();

    /**
     * @ignore
     */
    form: FormGroup;

    /**
     * 可用的变量类型
     */
    types: VariableTypeDes[] = [];

    /**
     * 参数类型
     */
    variableType: string;

    /**
     * @ignore
     */
    subscription: Subscription;

    constructor(
        private fb: FormBuilder,
        private constant: StrategyConstantService,
        private translate: TranslateService,
    ) {
        this.initForm();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.types = this.constant.VARIABLE_TYPES.filter(item => this.isAlternation ? item.id !== VariableType.ENCRYPT_STRING_TYPE : item.id !== VariableType.BUTTON_TYPE);

        this.translate.get(this.isAlternation ? 'BUTTON_TYPE' : 'VARIABLE').subscribe(res => this.variableType = res);

        this.subscription = this.type.valueChanges
            .subscribe(_ => {
                this.resetDefaultValue();
            });
    }

    /**
     * @ignore
     */
    initForm(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, variableNameValidator]],
            des: ['', Validators.required],
            comment: '',
            type: [0, Validators.required],
            defaultValue: 0,
        });
    }

    /**
     * 重置变更的默认值；
     * 当变量的类型发生变化时，需要重置它的值；
     */
    private resetDefaultValue(): void {
        const selectedType = this.type.value;

        if (selectedType === VariableType.BOOLEAN_TYPE || selectedType === VariableType.NUMBER_TYPE) {
            this.form.patchValue({ defaultValue: 0 });
        } else if (selectedType === VariableType.BUTTON_TYPE) {
            this.form.patchValue({ defaultValue: this.constant.VALUE_OF_BUTTON_TYPE_ARG });
        } else {
            this.form.patchValue({ defaultValue: '' });
        }

        if (selectedType === VariableType.BUTTON_TYPE) {
            this.defaultValue.disable();
        } else {
            this.defaultValue.enable();
        }

        if (selectedType === VariableType.SELECT_TYPE) {
            this.defaultValue.setValidators([Validators.required, selectTypeValueValidator]);
        } else {
            this.defaultValue.setValidators(null);
        }

        this.defaultValue.updateValueAndValidity();
    }

    /**
     * 输出需要添加的参数值；
     */
    emit(param: StrategyMetaArg): void {
        /**
         * 按钮时，调用了defaultValue的 disable方法，表单里是没有default这一项的，所以要手动加上。
         */
        if (param.type === VariableType.BUTTON_TYPE) {
            this.add.next({ ...param, defaultValue: this.constant.VALUE_OF_BUTTON_TYPE_ARG });
        } else {
            this.add.next(param);
        }
    }

    /**
     * @ignore
     */
    get name(): AbstractControl {
        return this.form.get('name');
    }

    /**
     * @ignore
     */
    get des(): AbstractControl {
        return this.form.get('des');
    }

    /**
     * @ignore
     */
    get comment(): AbstractControl {
        return this.form.get('comment');
    }

    /**
     * @ignore
     */
    get type(): AbstractControl {
        return this.form.get('type');
    }

    /**
     * @ignore
     */
    get defaultValue(): AbstractControl {
        return this.form.get('defaultValue');
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
