import { Component, OnDestroy, OnInit } from '@angular/core';

import { PublicService } from './../../providers/public.service';


@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
    styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit, OnDestroy {

    constructor(
        private publicService: PublicService,
    ) { }

    ngOnInit() {
        this.publicService.toggleFooter();
    }

    ngOnDestroy() {
        this.publicService.toggleFooter();
    }

}
