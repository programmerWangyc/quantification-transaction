import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs/Observable';

import { VariableType } from '../interfaces/constant.interface';
import { TemplateVariableOverview, VariableOverview } from './../interfaces/constant.interface';
import { AuthService } from './../shared/providers/auth.service';
import { ConstantService } from './constant.service';

@Injectable()
export class EncryptService {

    constructor(
        private constantService: ConstantService,
        private authService: AuthService,
    ) { }

    encryptPassword(password: string): string {
        return CryptoJS.MD5(password + '/botvs').toString();
    }

    encryptText(data: string, password: string): string {
        let key: string = this.encryptPassword(password);

        for (var i = 0; i < 5; i++) {
            key = CryptoJS.MD5(key).toString();
        }

        const encodedKey = CryptoJS.enc.Utf8.parse(key);

        return CryptoJS.AES.encrypt(data, encodedKey, { iv: encodedKey }).toString();
    }

    decryptText(data: string, password: string): string {
        let key = this.encryptPassword(password);

        for (var i = 0; i < 5; i++) {
            key = CryptoJS.MD5(key).toString();
        }

        const encodedKey = CryptoJS.enc.Utf8.parse(key);

        return CryptoJS.AES.decrypt(data, encodedKey, { iv: encodedKey }).toString(CryptoJS.enc.Utf8);
    }

    isNeedEncrypt(args: VariableOverview[]): boolean {
        return args.some(arg => arg.variableTypeId === 4 && (<string>arg.variableValue).indexOf(this.constantService.ENCRYPT_PREFIX) !== 0);
    }

    transformStrategyArgsToEncryptType(data: Observable<VariableOverview[]>, isEncrypt = true): Observable<Array<string | number | boolean>[]> {
        return data.mergeMap(variables => Observable.from(variables)
            .mergeMap(item => this.transformArgs(item, isEncrypt))
            .reduce(this.putInArray, [])
        );
    }

    transformTemplateArgsToEncryptType(data: Observable<TemplateVariableOverview[]>, isEncrypt = true): Observable<Array<string | number | boolean>[]> {
        return data.mergeMap(variables => Observable.from(variables)
            .mergeMap(variable => Observable.from(variable.variables)
                .mergeMap(item => this.transformArgs(item, isEncrypt).map(res => [...res, variable.id]))
            )
            .reduce(this.putInArray, [])
        );
    }

    /**
     * @description Transform data to ary structure, usually for api interactive purpose;
     */
    private transformArgs(data: VariableOverview, isEncrypt = true): Observable<Array<string | number | boolean>> {
        const { variableName, variableValue, variableTypeId, originValue } = data;

        const name = variableName.split('@')[0]; // FIXME: 这个地方为啥去割了一刀，没看懂。

        if (variableTypeId === VariableType.SELECT_TYPE) {
            const index = this.constantService.transformStringToList(<string>originValue)
                .findIndex(item => item === variableValue);

            return Observable.of([name, index]);
        } else if (variableTypeId === VariableType.ENCRYPT_STRING_TYPE && (<string>variableValue).indexOf(this.constantService.ENCRYPT_PREFIX) !== 0 && isEncrypt) {
            return this.authService.getTemporaryPwd()
                .map(pwd => [name, this.constantService.ENCRYPT_PREFIX + this.encryptText(<string>variableValue, pwd)])
                .take(1);
        } else {
            return Observable.of([name, variableValue]);
        }
    }

    private putInArray(acc: Array<string | number>[], cur: Array<string | number>): Array<string | number>[] {
        acc.push(cur);

        return acc;
    }
}
