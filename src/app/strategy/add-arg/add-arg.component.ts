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




    @Input() isAlternation = false;




    @Output() add: EventEmitter<StrategyMetaArg> = new EventEmitter();




    form: FormGroup;




    types: VariableTypeDes[] = [];




    variableType: string;




    subscription: Subscription;

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

        this.subscription = this.type.valueChanges
            .subscribe(_ => {
                this.resetDefaultValue();
            });
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




    emit(param: StrategyMetaArg): void {



        if (param.type === VariableType.BUTTON_TYPE) {
            this.add.next({ ...param, defaultValue: this.constant.VALUE_OF_BUTTON_TYPE_ARG });
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




    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
