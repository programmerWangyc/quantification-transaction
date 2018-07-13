import { Component, OnDestroy, OnInit } from '@angular/core';

import { PublicService } from '../providers/public.service';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

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
