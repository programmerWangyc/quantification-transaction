import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { from as observableFrom, Observable, of as observableOf } from 'rxjs';
import { map, mergeMap, reduce, take } from 'rxjs/operators';

import { VariableType } from '../app.config';
import { TemplateVariableOverview, VariableOverview } from './../interfaces/app.interface';
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
        return data
            .pipe(
                mergeMap(variables => observableFrom(variables)
                    .pipe(
                        mergeMap(item => this.transformArgs(item, isEncrypt)),
                        reduce(this.putInArray, [])
                    )
                )
            );
    }

    transformTemplateArgsToEncryptType(data: Observable<TemplateVariableOverview[]>, isEncrypt = true): Observable<Array<string | number | boolean>[]> {
        return data
            .pipe(
                mergeMap(variables => observableFrom(variables)
                    .pipe(
                        mergeMap(variable => observableFrom(variable.variables)
                            .pipe(
                                mergeMap(item => this.transformArgs(item, isEncrypt)
                                    .pipe(
                                        map(res => [...res, variable.id])
                                    )
                                )
                            )
                        ),
                        reduce(this.putInArray, [])
                    )
                )
            );
    }

    /**
     *  Transform data to ary structure, usually for api interactive purpose;
     */
    private transformArgs(data: VariableOverview, isEncrypt = true): Observable<Array<string | number | boolean>> {
        const { variableName, variableValue, variableTypeId, originValue } = data;

        const name = this.constantService.removeConditionInName(variableName);

        if (variableTypeId === VariableType.SELECT_TYPE) {
            const index = this.constantService.transformStringToList(<string>originValue)
                .findIndex(item => item === variableValue);

            return observableOf([name, index]);
        } else if (variableTypeId === VariableType.ENCRYPT_STRING_TYPE && (<string>variableValue).indexOf(this.constantService.ENCRYPT_PREFIX) !== 0 && isEncrypt) {
            return this.authService.getTemporaryPwd()
                .pipe(
                    map(pwd => [name, this.constantService.ENCRYPT_PREFIX + this.encryptText(<string>variableValue, pwd)]),
                    take(1)
                );

        } else {
            return observableOf([name, variableValue]);
        }
    }

    private putInArray(acc: Array<string | number>[], cur: Array<string | number>): Array<string | number>[] {
        acc.push(cur);

        return acc;
    }
}
