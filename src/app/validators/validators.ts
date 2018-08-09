import { AbstractControl, FormControl, FormGroup } from '@angular/forms';


export interface ValidatorResult {
    [key: string]: any;
}


export const usernameFormat = /^\w[\w\d\_\-\~]{2,8}$/;

export function usernameValidator(input: AbstractControl): ValidatorResult {
    return usernameFormat.test(input.value) ? null : { usernameFormat: 'USERNAME_FORMAT_ERROR' };
}

export const passwordFormat = /^\w{6,16}$/;

export function passwordValidator(input: AbstractControl): ValidatorResult {
    return passwordFormat.test(input.value) ? null : { passwordFormat: 'PASSWORD_FORMAT_ERROR' };
}

export const emailFormat = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+\.){1,63}[a-z0-9]+$/;

export function emailValidator(input: AbstractControl): ValidatorResult {
    return emailFormat.test(input.value) ? null : { emailFormat: 'EMAIL_FORMAT_ERROR' };
}

export function passwordMatchValidator(info: FormGroup): ValidatorResult {
    const password: FormControl = info.get('password') as FormControl;

    const confirmPassword: FormControl = info.get('confirmPassword') as FormControl;

    return password.value === confirmPassword.value ? null : { mismatch: 'PASSWORD_MISMATCH_ERROR' };
}

export const comparableVariableNameFormat = /^([a-zA-Z_$][0-9a-zA-Z_$]*)@([a-zA-Z_$][0-9a-zA-Z_$]*)([=!><]=|>|<)([0-9]*)$/;

export const booleanableVariableNameFormat = /^([a-zA-Z_$][0-9a-zA-Z_$]*)@([!]*[a-zA-Z_$][0-9a-zA-Z_$]*)$/;

export const variableNameFormat = /^[a-zA-Z]\w{0,50}$/;

export function variableNameValidator(input: AbstractControl): ValidatorResult {
    const value = input.value;

    const spaceReg = /\s+/g;

    const hasSpace = spaceReg.test(value);

    const isNormalName = variableNameFormat.test(value);

    const isLogicName1 = comparableVariableNameFormat.test(value);

    const isLogicName2 = booleanableVariableNameFormat.test(value);

    if (hasSpace) {
        return { containSpace: 'VARIABLE_NAME_HAS_SPACE_TIP' };
    }

    if (isNormalName || isLogicName1 || isLogicName2) {
        return null;
    }

    return { variableNameFormat: 'INVALID_VARIABLE_NAME_ERROR' };
}

export const selectTypeValueFormat = /^([^\|]+\|)+([^\|]+)$/;

export function selectTypeValueValidator(input: AbstractControl): ValidatorResult {
    return selectTypeValueFormat.test(input.value) ? null : { selectTypeValueFormat: 'SELECT_TYPE_VALUE_FORMAT_ERROR' };
}

export const pictureUrlReg = /http[s]?:\/{2}.*?\.(jpg|png|gif)/g;
