import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.scss'],
})
export class ExchangeComponent implements OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'EXCHANGE' }];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * Navigate to other pate;
     * @param path target route;
     */
    navigateTo(path: string, isRelativeToParent = false): void {
        this.router.navigate([path], { relativeTo: isRelativeToParent ? this.activatedRoute.parent : this.activatedRoute });
    }

}
