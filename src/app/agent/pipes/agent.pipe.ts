import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BtNode } from '../../interfaces/response.interface';

@Pipe({ name: 'agentRegion' })
export class AgentRegionPipe implements PipeTransform {
    constructor(private translate: TranslateService) { }

    transform(value: BtNode): string {
        const { region, city, name } = value;

        return `${this.get(region)} ${this.get(city)} ${name}`;
    }

    /**
     * @ignore
     */
    protected get(input: string): string {
        const language = this.translate.getDefaultLang();

        let arr = input.split('|');

        if (arr.length !== 2) {
            arr = input.split('||');

            if (arr.length !== 2) {
                return input;
            }
        }

        const reg = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;

        if (!reg.exec(arr[0])) {
            return language === 'en' ? arr[0] : arr[1];
        }

        return language === 'zh' ? arr[0] : arr[1];
    }
}

@Pipe({ name: 'isOldVersion' })
export class IsOldVersionPipe implements PipeTransform {
    transform(version: string, latestVersion: string): boolean {
        if (!version || !latestVersion) return false;

        const curVersion = version.split('.');

        const newVersion = latestVersion.split('.');

        const length = curVersion.length > newVersion.length ? curVersion.length : newVersion.length;

        let result = false;

        for (let i = 0; i < length; i += 1) {
            if (curVersion[i] < newVersion[i]) {
                result = true;
                break;
            }
        }

        return result;
    }
}
