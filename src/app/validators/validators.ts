import { FormControl, FormGroup } from '@angular/forms';


export interface ValidatorResult {
    [key: string]: any;
}


export const usernameFormat = /^\w[\w\d\_\-\~]{2,8}$/;

export function usernameValidator(input: FormControl): ValidatorResult {
    return usernameFormat.test(input.value) ? null : { usernameFormat: 'USERNAME_FORMAT_ERROR'};
}

export const passwordFormat = /^\w{6,16}$/;

export function passwordValidator(input: FormControl): ValidatorResult {
    return passwordFormat.test(input.value) ? null : { passwordFormat: 'PASSWORD_FORMAT_ERROR'}
}

export const emailFormat = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+\.){1,63}[a-z0-9]+$/;

export function emailValidator(input: FormControl): ValidatorResult {
    return emailFormat.test(input.value) ? null : { emailFormat: 'EMAIL_FORMAT_ERROR'};
}

export function passwordMatchValidator(info: FormGroup): ValidatorResult {
    const password: FormControl = info.get('password') as FormControl;

    const confirmPassword: FormControl = info.get('confirmPassword') as FormControl;

    return  password.value === confirmPassword.value ? null : { mismatch: 'PASSWORD_MISMATCH_ERROR'};
}