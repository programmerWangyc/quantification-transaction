import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

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
}

@Component({
    selector: 'app-add-arg',
    templateUrl: './add-arg.component.html',
    styleUrls: ['./add-arg.component.scss']
})
export class AddArgComponent implements OnInit {
    @Input() isAlternation = false;

    @Output() add: EventEmitter<StrategyMetaArg> = new EventEmitter();

    form: FormGroup;

    selectedType = 0;

    types: VariableTypeDes[] = [];

    variableType: string;

    constructor(
        private fb: FormBuilder,
        private constant: StrategyConstantService,
        private translate: TranslateService,
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.types = this.constant.VARIABLE_TYPES.filter(item => this.isAlternation ? item.id !== VariableType.ENCRYPT_STRING_TYPE : item.id !== VariableType.BUTTON_TYPE);

        this.translate.get(this.isAlternation ? 'BUTTON_TYPE' : 'VARIABLE').subscribe(res => this.variableType = res);
    }

    initForm(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, variableNameValidator]],
            des: ['', Validators.required],
            comment: '',
            type: [0, Validators.required],
            defaultValue: 0,
        });
    }

    resetDefaultValue(): void {
        if (this.selectedType === VariableType.BOOLEAN_TYPE || this.selectedType === VariableType.NUMBER_TYPE) {
            this.form.patchValue({ defaultValue: 0 });
        } else if (this.selectedType === VariableType.BUTTON_TYPE) {
            this.form.patchValue({ defaultValue: this.constant.BUTTON_TYPE_VARIABLE_DEFAULT_VALUE });
        }
        else {
            this.form.patchValue({ defaultValue: '' });
        }

        if(this.selectedType === VariableType.BUTTON_TYPE) {
            this.defaultValue.disable();
        }else {
            this.defaultValue.enable();
        }

        if (this.selectedType === VariableType.SELECT_TYPE) {
            this.defaultValue.setValidators([Validators.required, selectTypeValueValidator]);
        } else {
            this.defaultValue.setValidators(null);
        }

        this.defaultValue.updateValueAndValidity();
    }

    emit(param: StrategyMetaArg): void {
        /**
         * @description 按钮时，调用了defaultValue的 disable方法，表单里是没有default这一项的，所以要手动加上。
         */
        if (param.type === VariableType.BUTTON_TYPE) {
            this.add.next({ ...param, defaultValue: this.constant.BUTTON_TYPE_VARIABLE_DEFAULT_VALUE });
        } else {
            this.add.next(param);
        }
    }

    get name(): AbstractControl {
        return this.form.get('name');
    }

    get des(): AbstractControl {
        return this.form.get('des');
    }

    get comment(): AbstractControl {
        return this.form.get('comment');
    }

    get type(): AbstractControl {
        return this.form.get('type');
    }

    get defaultValue(): AbstractControl {
        return this.form.get('defaultValue');
    }

}
