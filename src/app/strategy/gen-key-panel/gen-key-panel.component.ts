import { Component, OnInit, Input } from '@angular/core';
import { Path } from '../../interfaces/constant.interface';

@Component({
    selector: 'app-gen-key-panel',
    templateUrl: './gen-key-panel.component.html',
    styleUrls: ['./gen-key-panel.component.scss']
})
export class GenKeyPanelComponent implements OnInit {
    @Input() set type(value) {
        this._type = value;

        this.isShare = value === 0;
    }

    get type() {
        return this._type;
    }

    @Input() strategyId: number;

    @Input() code: string;

    private _type : number;

    isShare = false;

    url: string;

    constructor() { }

    ngOnInit() {
        this.url = location.protocol + '//' + [location.host, Path.dashboard, Path.strategy, Path.verify].join('/');
    }

}
