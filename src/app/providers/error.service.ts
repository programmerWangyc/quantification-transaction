import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { TipService } from './tip.service';

@Injectable()
export class ErrorService {

    constructor(private tipService: TipService) { }

    handleResponseError(source: Observable<string>): Subscription {
        return source.subscribe(data => this.tipService.showTip(data));
    }
}
