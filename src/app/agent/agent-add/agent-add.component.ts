import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-agent-add',
    templateUrl: './agent-add.component.html',
    styleUrls: ['./agent-add.component.scss'],
})
export class AgentAddComponent implements OnInit {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'AGENT', path: '../' }, { name: 'CREATE' }];

    constructor() { }

    ngOnInit() {
    }

}
