import '../../../../node_modules/codemirror/keymap/vim';

import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

import { CategoryType } from '../../interfaces/request.interface';
import { StrategyDetail } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { StrategyConstantService } from '../providers/strategy.constant.service';
import { StrategyService } from '../providers/strategy.service';
import { Language } from '../strategy.config';

const beautify = require('js-beautify').js;

export interface Tab {
    name: string;
    icon: string;
}

export interface CodeContent {
    code: string;
    note: string;
    des: string;
    manual: string;
}

export interface FileContent {
    content: Blob;
    extensionName: string;
}

@Component({
    selector: 'app-strategy-codemirror',
    templateUrl: './strategy-codemirror.component.html',
    styleUrls: ['./strategy-codemirror.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class StrategyCodemirrorComponent implements OnInit, OnDestroy {
    tabs: Tab[] = [
        { name: 'CODE', icon: 'anticon-code-o' },
        { name: 'NOTE', icon: 'anticon-file-text' },
        { name: 'DESCRIPTION', icon: 'anticon-tags-o' },
        { name: 'MANUAL', icon: 'anticon-switcher' },
    ];

    @Input() set strategy(data: StrategyDetail) {
        if (!data) return;

        this._strategy = data;

        const { source, note, manual, description } = data;

        this.codeContent = source;

        this.noteContent = note;

        this.manualContent = manual;

        this.desContent = description;
    }

    @Input() mode: number;

    @Input() set language(value: number) {
        this._language = value || Language.JavaScript;

        this.checkContent();
    }

    private _language: number;

    @Input() set category(value: number) {
        this._category = value || CategoryType.COMMODITY_FUTURES;

        this.checkContent();
    }

    private _category: number;

    private _strategy: StrategyDetail;

    codeContent: string;

    noteContent: string;

    manualContent: string;

    desContent: string;

    codeOptions = {
        lineNumbers: true,
        theme: 'eclipse',
        insertSoftTab: true,
        indentUnit: 4,
        styleActiveLine: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: {
            "-W041": false,
            latedef: true,
            lastsemic: true,
            loopfunc: true,
            asi: true,
        },
        showHint: true,
        matchBrackets: true,
        mode: "javascript",
    }

    fontSize = 14;

    editorThemes: string[];

    formatter: (value: number) => string;

    activateTabIndex = 0;

    @Output() save: EventEmitter<CodeContent> = new EventEmitter();

    @Output() download: EventEmitter<FileContent> = new EventEmitter();

    @ViewChild(CodemirrorComponent) codeMirror: CodemirrorComponent;

    vimBtnText = 'OPEN_VIM_MODE';

    isFullScreen = false;

    sub$$: Subscription;

    constructor(
        private translate: TranslateService,
        private constant: StrategyConstantService,
        private strategyService: StrategyService,
        private renderer2: Renderer2,
        private eleRef: ElementRef,
        private publicService: PublicService,
    ) { }

    ngOnInit() {
        this.translate.get('FONT_SIZE').subscribe(label => this.formatter = this.formatterFactory(label));

        this.editorThemes = this.constant.EDITOR_THEMES;

        this.sub$$ = this.publicService.getFavoriteEditorConfig().subscribe(config => {
            const fontSize = <number>config.fontSize;

            if (fontSize && this.fontSize !== fontSize) this.fontSize = fontSize;

            const theme = <string>config.theme;

            if (theme && this.codeOptions.theme !== theme) this.codeOptions.theme = theme;
        })
    }

    private formatterFactory(label: string): (v: number) => string {
        return (value: number) => label + value + 'px';
    }

    parser(value: string): number {
        const res = +value.match(/\d+/g);

        if (res) {
            return res[0];
        } else {
            return 0;
        }
    }

    isCodeChanged(): boolean {
        return this.codeContent !== this._strategy.source;
    }

    /**
     * @description Used to check code content when language or category is changed.
     */
    private checkContent(): void {
        const target = this.constant.LANGUAGE_INITIAL_VALUE.get(this._language);

        const isInitialValue = this.constant.isInitialValue(this.codeContent);

        if (!this.codeContent || isInitialValue) {
            this.codeContent = this._category === CategoryType.TEMPLATE_LIBRARY ? target.templateValue : target.codeValue;
        }

        this.codeOptions.mode = target.mode;
    }

    export(): void {
        const target = this.constant.LANGUAGE_INITIAL_VALUE.get(this._language);

        const extensionName = target.extensionName;

        const content = new Blob([this.codeContent, { type: `application/${target.mode}charset=utf8;` }]);

        this.download.next({ content, extensionName });
    }

    /**
     * @description Set editor font size, and update user favorite editor config;
     */
    setFontSize(): void {
        const ele = this.eleRef.nativeElement.querySelector('.CodeMirror');

        this.renderer2.setStyle(ele, 'font-size', this.fontSize + 'px');

        this.publicService.updateEditorConfig({ fontSize: this.fontSize });
    }

    /**
     * @description Set editor theme, and update user favorite editor config;
     */
    setTheme(theme: string): void {
        this.codeOptions.theme = theme;

        this.codeMirror.codeMirror.setOption('theme', theme);

        this.publicService.updateEditorConfig({ theme })
    }

    /**
     * @description Format code use js-beautify
     */
    formatCode(): void {
        this.codeContent = beautify(this.codeContent);
    }

    /**
     * @description Toggle edit mode between 'default' and 'vim';
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
     * @description Toggle edit area size. The method that code mirror applied has no effect, achieve the effect by dynamically toggle classes and attributes.
     */
    toggleFullScreen(): void {
        this.isFullScreen = !this.isFullScreen;

        const mirror = this.eleRef.nativeElement.querySelector('.CodeMirror');

        const area = this.eleRef.nativeElement.querySelector('.editor-area');

        const control = this.eleRef.nativeElement.querySelector('#control');

        if (this.isFullScreen) {
            this.renderer2.addClass(area, 'full-screen');
            this.renderer2.setStyle(mirror, 'height', '100vh');
            this.renderer2.addClass(control, 'full-screen-control');
        } else {
            this.renderer2.removeClass(area, 'full-screen');
            this.renderer2.removeStyle(mirror, 'height');
            this.renderer2.removeClass(control, 'full-screen-control');
        }

        this.codeMirror.codeMirror.focus();
    }

    ngOnDestroy() {
        this.sub$$.unsubscribe();
    }
}


