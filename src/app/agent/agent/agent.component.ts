import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-agent',
    templateUrl: './agent.component.html',
    styleUrls: ['./agent.component.scss'],
})
export class AgentComponent implements OnInit {
    paths: Breadcrumb[] = [{ name: 'AGENT' }];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    ngOnInit() {
    }

    navigateTo(path: string, isRelativeToParent = false): void {
        this.router.navigate([path], { relativeTo: isRelativeToParent ? this.activatedRoute.parent : this.activatedRoute });
    }
}
