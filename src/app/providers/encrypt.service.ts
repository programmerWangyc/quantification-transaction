import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptService {

    constructor() { }

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

    submit() {

    }
}
