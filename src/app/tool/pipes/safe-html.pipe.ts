import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) { }

    /**
     * TODO: 仅用了框架的方法处理了输入，不确定能否达到安全要求；
     */
    transform(source: string): SafeHtml {
        return this.domSanitizer.bypassSecurityTrustHtml(source);
    }
}
