import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

import { selectTypeValueValidator, variableNameValidator } from '../../validators/validators';

@Directive({
    selector: '[variableNameValidate]',
    providers: [{ provide: NG_VALIDATORS, useExisting: VariableNameValidateDirective, multi: true }]
})
export class VariableNameValidateDirective implements Validator {

    constructor() { }

    validate(control: AbstractControl): { [key: string]: any } | null {
        return variableNameValidator(control);
    }
}

@Directive({
    selector: '[selectTypeValueValidate]',
    providers: [{ provide: NG_VALIDATORS, useExisting: SelectTypeValueValidateDirective, multi: true }]
})
export class SelectTypeValueValidateDirective implements Validator {
    constructor() { }

    validate(control: AbstractControl): { [key: string]: any } | null {
        return selectTypeValueValidator(control);
    }
}
