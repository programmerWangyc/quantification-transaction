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
import { of, Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

/**
 * TODO: 有时候代码会刷不出来，没定位到是哪的问题；
 */
@Component({
    selector: 'app-strategy-codemirror',
    templateUrl: './strategy-codemirror.component.html',
    styleUrls: ['./strategy-codemirror.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class StrategyCodemirrorComponent implements OnInit, OnDestroy {

    /**
     * Tabs for edit area;
     */
    tabs: Tab[] = [
        { name: 'CODE', icon: 'anticon-code-o' },
        { name: 'NOTE', icon: 'anticon-file-text' },
        { name: 'DESCRIPTION', icon: 'anticon-tags-o' },
        { name: 'MANUAL', icon: 'anticon-switcher' },
    ];

    /**
     * @ignore
     */
    @Input() set strategy(data: StrategyDetail) {
        if (!data) return;

        this._strategy = data;

        const { source, note, manual, description } = data;

        this.codeContent = source;

        this.noteContent = note;

        this.manualContent = manual;

        this.desContent = description;
    }

    /**
     * @ignore
     */
    private _strategy: StrategyDetail;

    /**
     * 当前策略使用的编程语言
     */
    @Input() set language(value: number) {
        this._language = value || Language.JavaScript;

        this.checkContent();
    }

    /**
     * @ignore
     */
    private _language: number = 0;

    /**
     * 当前策略所属的种类
     */
    @Input() set category(value: number) {
        this._category = value || CategoryType.COMMODITY_FUTURES;

        this.checkContent();
    }

    /**
     * @ignore
     */
    private _category: number;

    /**
     * 代码
     */
    codeContent: string = '';

    /**
     * 笔记
     */
    noteContent: string = '';

    /**
     * 手册
     */
    manualContent: string = '';

    /**
     * 描述
     */
    desContent: string = '';

    /**
     * Code mirror的配置
     */
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

    /**
     * @ignore
     */
    fontSize = 14;

    /**
     * @ignore
     */
    editorThemes: string[];

    /**
     * 代码格式化的功能函数；
     */
    formatter: (value: number) => string;

    /**
     * @ignore
     */
    activateTabIndex = 0;

    /**
     * 保存代码
     */
    @Output() save: EventEmitter<CodeContent> = new EventEmitter();

    /**
     * 下载代码
     */
    @Output() download: EventEmitter<FileContent> = new EventEmitter();

    /**
     * @ignore
     */
    @ViewChild(CodemirrorComponent) codeMirror: CodemirrorComponent;

    /**
     * @ignore
     */
    vimBtnText = 'OPEN_VIM_MODE';

    /**
     * 是否全屏
     */
    isFullScreen = false;

    /**
     * @ignore
     */
    sub$$: Subscription;

    /**
     * 保存回测设置
     */
    saveBacktest$: Subject<boolean> = new Subject();

    /**
     * 是否处于保存回测的状态；
     */
    isSaveBacktestConfig = false;

    constructor(
        private translate: TranslateService,
        private constant: StrategyConstantService,
        private strategyService: StrategyService,
        private renderer2: Renderer2,
        private eleRef: ElementRef,
        private publicService: PublicService,
    ) {
        this.codeContent = this.constant.LANGUAGE_INITIAL_VALUE.get(this._language).codeValue;
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.translate.get('FONT_SIZE').subscribe(label => this.formatter = this.formatterFactory(label));

        this.editorThemes = this.constant.EDITOR_THEMES;

        this.launch();
    }

    /**
     * @ignore
     */
    launch() {
        this.sub$$ = this.publicService.getFavoriteEditorConfig().subscribe(config => {
            const fontSize = <number>config.fontSize;

            if (fontSize && this.fontSize !== fontSize) this.fontSize = fontSize;

            const theme = <string>config.theme;

            if (theme && this.codeOptions.theme !== theme) this.codeOptions.theme = theme;
        })
            .add(this.saveBacktest$.pipe(
                switchMap(isOpen => isOpen ? this.strategyService.getBacktestConfig() : of(null))
            )
                .subscribe(comment => !!comment && (this.codeContent = this.replaceComment(comment)))
            );
    }

    /**
     * 生成格式化代码函数的工厂函数；
     */
    private formatterFactory(label: string): (v: number) => string {
        return (value: number) => label + value + 'px';
    }

    /**
     * 数字输入框的辅助解析函数
     * @param value 输入框的内容
     */
    parser(value: string): number {
        const res = +value.match(/\d+/g);

        return res ? res[0] : 0;
    }

    /**
     * 代码内容是否发生了改变
     */
    isCodeChanged(): boolean {
        if (this._strategy) {
            return this.codeContent !== this._strategy.source;
        } else {
            return true;
        }
    }

    /**
     * Used to check code content when language or category is changed.
     */
    private checkContent(): void {
        const target = this.constant.LANGUAGE_INITIAL_VALUE.get(this._language);

        const isInitialValue = this.constant.isInitialValue(this.codeContent);

        if (!this.codeContent || isInitialValue) {
            this.codeContent = this._category === CategoryType.TEMPLATE_LIBRARY ? target.templateValue : target.codeValue;
        } else {
            // nothing to do;
        }

        this.codeOptions.mode = target.mode;
    }

    /**
     * 导出代码的内容
     */
    export(): void {
        const target = this.constant.LANGUAGE_INITIAL_VALUE.get(this._language);

        const extensionName = target.extensionName;

        const content = new Blob([this.codeContent, { type: `application/${target.mode}charset=utf8;` }]);

        this.download.next({ content, extensionName });
    }

    /**
     * Set editor font size, and update user favorite editor config;
     */
    setFontSize(): void {
        const ele = this.eleRef.nativeElement.querySelector('.CodeMirror');

        this.renderer2.setStyle(ele, 'font-size', this.fontSize + 'px');

        this.publicService.updateEditorConfig({ fontSize: this.fontSize });
    }

    /**
     * Set editor theme, and update user favorite editor config;
     */
    setTheme(theme: string): void {
        this.codeOptions.theme = theme;

        this.codeMirror.codeMirror.setOption('theme', theme);

        this.publicService.updateEditorConfig({ theme })
    }

    /**
     * Format code use js-beautify
     */
    formatCode(): void {
        this.codeContent = beautify(this.codeContent);
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
     * Toggle edit area size. The method that code mirror applied has no effect, achieve the effect by dynamically toggle classes and attributes.
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

    /**
     * 生成注释
     * @param comment 注释内容
     */
    createComment(comment: string): string {
        if (this._language === Language.Python) {
            return `'''backtest\n${comment}\n'''`;
        } else {
            return `/*backtest\n${comment}\n*/`;
        }
    }

    /**
     * 替换注释
     * @param comment 注释内容
     */
    replaceComment(comment: string): string {
        const reg = this._language === Language.Python ? this.constant.pyCommentReg : this.constant.jsCommentReg;

        const result = this.codeContent.match(reg);

        if (!result) {
            return this.createComment(comment) + '\n\n' + this.codeContent;
        } else {
            return this.codeContent.replace(reg, this.createComment(comment));
        }
    }

    /**
     * 切换保存回测设置的状态
     */
    toggleSaveBacktestConfig() {
        this.isSaveBacktestConfig = !this.isSaveBacktestConfig;

        this.saveBacktest$.next(this.isSaveBacktestConfig);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.sub$$.unsubscribe();
    }
}
