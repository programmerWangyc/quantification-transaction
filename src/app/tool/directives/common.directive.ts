import { Directive, Input, Output, EventEmitter, TemplateRef, OnInit, ViewContainerRef } from '@angular/core';


@Directive({ selector: '[commentControl]' })
export class CommentControlDirective implements OnInit {
    // tslint:disable-next-line:no-input-rename
    @Input('user') username = '';

    // tslint:disable-next-line:no-input-rename
    @Input('currentUser') curUsername = '';

    @Output() edit: EventEmitter<string> = new EventEmitter();

    @Output() delete: EventEmitter<number> = new EventEmitter();

    constructor(
        private templateRef: TemplateRef<any>,
        private vcr: ViewContainerRef
    ) {
        console.log(this.templateRef);
        console.log(this.vcr);
    }

    ngOnInit() {
        console.log(this.username);
    }
}
