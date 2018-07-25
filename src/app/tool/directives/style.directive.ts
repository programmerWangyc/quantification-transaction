import { Directive, ElementRef, Input, OnInit } from '@angular/core';


// tslint:disable-next-line:directive-selector
@Directive({ selector: '[bt-text-center]' })
export class TextCenterDirective {
    constructor(private el: ElementRef) {
        this.el.nativeElement.style.textAlign = 'center';
    }
}

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[bt-text-direction]' })
export class TextDirectionDirective implements OnInit {
    @Input('direction') direction = 'center';

    constructor(private ele: ElementRef) { }

    ngOnInit() {
        this.ele.nativeElement.style.textAlign = this.direction;
    }
}
