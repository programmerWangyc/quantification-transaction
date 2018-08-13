import { Component, ElementRef, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { FileUploader } from 'ng2-file-upload';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ExchangePairBusinessComponent } from '../../base/base.component';
import { SelectedPair, TemplateVariableOverview, VariableOverview } from '../../interfaces/app.interface';
import { ModifyRobotRequest } from '../../interfaces/request.interface';
import { BtNode, Platform } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { K_LINE_PERIOD } from '../../providers/constant.service';
import { PlatformService } from '../../providers/platform.service';
import { RobotOperateService } from '../providers/robot.operate.service';
import { RobotService } from '../providers/robot.service';

export interface RobotConfigForm {
    robotName: string;
    kLinePeriod: number;
    platform: number; // 交易平台，和 stock合成交易对
    stock: string;
    agent: number;
}

@Component({
    selector: 'app-robot-config',
    templateUrl: './robot-config.component.html',
    styleUrls: ['./robot-config.component.scss'],
})
export class RobotConfigComponent extends ExchangePairBusinessComponent {
    subscription$$: Subscription;

    isFold = false;

    modify$: Subject<RobotConfigForm> = new Subject();

    configForm: FormGroup;

    periods = K_LINE_PERIOD;

    agents: Observable<BtNode[]>;

    isCustomStock = false;

    platforms: Platform[] = [];

    selectedPairs: SelectedPair[] = [];

    hasArgs: Observable<boolean>;

    strategyArgs: Observable<VariableOverview[]>;

    templateArgs: Observable<TemplateVariableOverview[]>;

    uploader = new FileUploader({ url: '' });

    warningMessage: Observable<SafeHtml>;

    hasStrategyArg: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        public eleRef: ElementRef,
        public render: Renderer2,
        private robotService: RobotService,
        private btNodeService: BtNodeService,
        private platformService: PlatformService,
        private domSanitizer: DomSanitizer,
        private robotOperate: RobotOperateService,
    ) {
        super(render, eleRef);

        this.initialForm();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    launch() {
        this.subscription$$ = this.robotService.getRobotDetail()
            .subscribe(robot => this.configForm.patchValue({
                robotName: robot.name,
                kLinePeriod: JSON.parse(robot.strategy_exchange_pairs)[0],
            }))
            .add(this.agents.subscribe(list => list.length && this.agent.patchValue(list[0].id)))
            .add(this.platformService.getPlatformList().subscribe(list => {
                this.platforms = list;
                this.platform.patchValue(this.platforms[0].id);
            }))
            .add(this.robotOperate.launchUpdateRobotConfig(this.modify$.pipe(
                map(formValue => this.createModifyParams(formValue))
            )));
    }

    initialModel() {
        this.agents = this.btNodeService.getNodeList();

        this.strategyArgs = this.robotOperate.getRobotStrategyArgs();

        this.hasStrategyArg = this.strategyArgs.pipe(
            map(args => !!args.length)
        );

        this.templateArgs = this.robotOperate.getRobotTemplateArgs();

        this.hasArgs = this.robotOperate.hasArgs();

        this.warningMessage = this.robotOperate.getRobotConfigMessage().pipe(
            map(msg => this.domSanitizer.bypassSecurityTrustHtml(msg))
        );
    }

    initialForm() {
        this.configForm = this.fb.group({
            robotName: '',
            kLinePeriod: '',
            platform: ['', Validators.required],
            stock: '',
            agent: '',
        });
    }

    argChange(arg: VariableOverview, templateName?: string): void {
        arg.variableName && this.robotOperate.updateRobotArg(arg, templateName);
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

    // ====================================Component Shortcut methods=======================================

    createModifyParams(formValue: RobotConfigForm): ModifyRobotRequest {
        const { robotName, agent, kLinePeriod } = formValue;

        return { id: null, name: robotName, kLinePeriodId: kLinePeriod, nodeId: agent, args: null, ...this.robotOperate.getPairsParams(this.selectedPairs) };
    }

    exportArgs(): void {
        this.robotOperate.exportArgs(this.kLinePeriod.value); // !FIXME: 未处理取消订阅
    }

    importArgs(files: FileList): void {
        const reader = new FileReader();

        reader.readAsText(files[0]);

        reader.onload = (event: ProgressEvent) => {
            const result = JSON.parse((<FileReader>event.target).result);

            result.period && this.configForm.patchValue({ kLinePeriod: result.period });

            this.robotOperate.importArgs(result);
        };
    }

    get robotName(): AbstractControl {
        return this.configForm.get('robotName');
    }

    get kLinePeriod(): AbstractControl {
        return this.configForm.get('kLinePeriod');
    }

    get agent(): AbstractControl {
        return this.configForm.get('agent');
    }

    get stock(): AbstractControl {
        return this.configForm.get('stock');
    }

    get platform(): AbstractControl {
        return this.configForm.get('platform');
    }

    get selectedPlatform(): Observable<Platform> {
        return this.platformService.getPlatformList().pipe(
            map(list => list.find(item => item.id === this.platform.value))
        );
    }
}
