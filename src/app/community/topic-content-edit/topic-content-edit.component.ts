import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';

@Component({
    selector: 'app-topic-content-edit',
    templateUrl: './topic-content-edit.component.html',
    styleUrls: ['./topic-content-edit.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TopicContentEditComponent implements OnInit {

    /**
     * Tabs for edit area;
     */
    tabs: string[] = ['EDIT', 'PREVIEW'];

    /**
     * 内容
     */
    @Input() set data(input: string) {
        if (!!input) {
            this.content = input;

            this.originContent = input;
        }
    }

    /**
     * 需要插入的照片
     */
    @Input() set image(url: string) {
        if (!!url) {
            this.content = !!this.content ? this.content + ' ' + url + ' ' : url;
        }
    }

    /**
     * @ignore
     */
    content = '';

    /**
     * @ignore
     */
    private originContent = '';

    /**
     * Code mirror的配置
     */
    codeOptions = {
        lineNumbers: true,
        theme: 'eclipse',
        insertSoftTab: true,
        indentUnit: 4,
        styleActiveLine: true,
        gutters: ['CodeMirror-lint-markers'],
        lint: {
            '-W041': false,
            latedef: true,
            lastsemic: true,
            loopfunc: true,
            asi: true,
        },
        showHint: true,
        matchBrackets: true,
        mode: 'markdown',
    };

    /**
     * @ignore
     */
    activateTabIndex = 0;

    /**
     * @ignore
     */
    @ViewChild(CodemirrorComponent) codeMirror: CodemirrorComponent;

    /**
     * @ignore
     */
    vimBtnText = 'OPEN_VIM_MODE';

    constructor(
    ) {
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.launch();
    }

    /**
     * @ignore
     */
    launch() {
    }

    /**
     * 内容是否发生了改变
     */
    isCodeChanged(): boolean {
        if (this.content) {
            return this.content !== this.originContent;
        } else {
            return true;
        }
    }

    /**
     * Toggle edit mode between 'default' and 'vim';
     */
    toggleVimMode(): void {
        const editor = this.codeMirror.codeMirror;

        const targetMode = editor.getOption('keyMap') === 'vim' ? 'default' : 'vim';

        const text = { vim: 'CLOSE_VIM_MODE', default: 'OPEN_VIM_MODE' };

        editor.setOption('keyMap', targetMode);

        this.vimBtnText = text[targetMode];

        editor.focus();
    }

    /**
     * @ignore
     */
    ngOnDestroy() {

    }
}
