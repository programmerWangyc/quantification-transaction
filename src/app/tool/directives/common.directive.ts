import { Directive, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
    selector: '[routeDirective]',
})
export class RouteDirective {

    constructor(private router: Router) { }

    @HostListener('click', ['$event.target']) onClick($event) {
        const path = $event.getAttribute('data-link');

        path && this.router.navigateByUrl(path);
    }
}
