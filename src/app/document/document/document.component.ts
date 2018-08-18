import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { MarkdownService } from 'ngx-markdown';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Breadcrumb } from '../../interfaces/app.interface';
import { DocumentService } from '../providers/document.service';

export interface Anchor {
    name: string;
    anchor: string;
    level: number;
}

export class Catalog {

    /**
     * @ignore
     */
    classMap = {
        1: 'main-title',
        2: 'sub-title',
        3: 'sub-sub-title',
        4: 'sub-sub-sub-title',
    };

    /**
     * 所有的锚点
     */
    anchors: Anchor[] = [];

    constructor(
        public markdownService: MarkdownService,
    ) {
        this.reWriteRender();
    }

    /**
     * 重写 markdown 服务的方法，添加锚点。
     */
    protected reWriteRender(): void {
        this.markdownService.renderer.heading = (text: string, level: number) => {
            const id = this.randomId();

            const anchor = '#' + id;

            const name = this.removeTag(text);

            this.anchors.push({ name, anchor, level });

            return `
                <h${level}>
                    <a id='${id}' href='${anchor}'></a>
                    ${text}
                </h${level}>
            `;
        };
    }

    /**
     * 生成随机id
     */
    protected randomId() {
        const id = Math.random().toString(36).substr(2);

        const idx = id.search(/[a-z]/);

        return id.substring(idx);
    }

    /**
     * 移除标签；
     */
    protected removeTag(str: string): string {
        const tagReg = /<([a-z]+)>.*<\/\1>/;

        if (tagReg.test(str)) {
            const startIdx = str.search('>') + 1;

            const endIdx = str.search('</');

            return str.substring(startIdx, endIdx);
        } else {
            return str;
        }
    }

}

@Component({
    selector: 'app-document',
    templateUrl: './document.component.html',
    styleUrls: ['./document.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DocumentComponent extends Catalog implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'API_DOCUMENTATION' }];

    /**
     * @ignore
     */
    doc: Observable<string>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    constructor(
        private documentService: DocumentService,
        public markdownService: MarkdownService,
    ) {
        super(markdownService);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    launch(): void {
        this.documentService.launchDocument();

        this.documentService.handleGetDocumentError(() => this.isAlive);
    }

    /**
     * @ignore
     */
    initialModel(): void {
        this.doc = this.documentService.getDocument().pipe(
            map(res => res.content.replace('[TOC]', ''))
        );

        this.isLoading = this.documentService.isLoading();
    }

    /**
     * @ignore
     */
    ngOnDestroy(): void {
        this.isAlive = false;
    }
}
