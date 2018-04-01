import { Directive, ElementRef } from '@angular/core';


@Directive({
    selector: '[bt-text-center]'
})
export class TextCenterDirective {
    constructor(private el: ElementRef) {
        this.el.nativeElement.style.textAlign = 'center';
    }
}