import { Component, ElementRef, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { isEmpty } from 'lodash';
import { concat, Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { map, reduce, takeWhile } from 'rxjs/operators';

import { ExchangePairBusinessComponent } from '../../base/base.component';
import { GroupedStrategy, SelectedPair, SemanticArg, VariableOverview } from '../../interfaces/app.interface';
import { CategoryType, needArgsType, SaveRobotRequest } from '../../interfaces/request.interface';
import { Platform } from '../../interfaces/response.interface';
import { BtNodeService, GroupedNode } from '../../providers/bt-node.service';
import { K_LINE_PERIOD } from '../../providers/constant.service';
import { EncryptService } from '../../providers/encrypt.service';
import { PlatformService } from '../../providers/platform.service';
import { RobotOperateService } from '../providers/robot.operate.service';
import { RobotService } from '../providers/robot.service';
import { RobotStrategyService } from '../providers/robot.strategy.service';

export interface RobotCreationForm {
    robotName: string;
    agent: number;
    strategy: number;
    kLinePeriod: number;
    args: string;
}

@Component({
    selector: 'app-create-robot',
    templateUrl: './create-robot.component.html',
    styleUrls: ['./create-robot.component.scss'],
})
export class CreateRobotComponent extends ExchangePairBusinessComponent {
    /**
     * @ignore
     */
    isFold = false;

    /**
     * @ignore
     */
    labelSm = 2;

    /**
     * @ignore
     */
    controlSm = 8;

    /**
     * @ignore
     */
    xs = 24;

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    form: FormGroup;

    /**
     * kline period;
     */
    periods = K_LINE_PERIOD;


    /**
     * 交易平台
     */
    platforms: Platform[] = [];

    /**
     * 是否自定义股票
     */
    isCustomStock = false;

    /**
     * 选中的交易对
     */
    selectedPairs: SelectedPair[] = [];

    /**
     * 创建指令
     */
    create$: Subject<RobotCreationForm> = new Subject();

    /**
     * 托管者
     */
    agents: Observable<GroupedNode[]>;

    /**
     * 分组后的策略
     */
    strategies: Observable<GroupedStrategy[]>;

    /**
     * 策略参数
     */
    selectedStrategyArgs: SemanticArg = null;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private platformService: PlatformService,
        private robotOperate: RobotOperateService,
        private btNodeService: BtNodeService,
        private strategyService: RobotStrategyService,
        private robotService: RobotService,
        private encrypt: EncryptService,
        public eleRef: ElementRef,
        public render: Renderer2,
    ) {
        super(render, eleRef);
        this.initForm();
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
    initialModel() {
        this.agents = this.btNodeService.getGroupedNodeList('public', this.btNodeService.getAgentName);

        this.strategies = this.strategyService.getGroupedStrategy('category', this.strategyService.getCategoryName, this.strategyService.reverseGetCategoryName).pipe(
            map(list => list.map(({ groupName, values, groupNameValue }) => ({
                groupName,
                groupNameValue,
                values: values.filter(item => item.is_owner && item.category !== CategoryType.TEMPLATE_SNAPSHOT || item.category < CategoryType.TEMPLATE_LIBRARY),
            })).filter(collection => !isEmpty(collection.values)))
        );
    }

    /**
     * @ignore
     */
    launch() {
        const keepAlive = () => this.isAlive;

        this.platformService.getPlatformList().pipe(
            takeWhile(keepAlive)
        ).subscribe(list => this.platforms = list);

        this.strategyService.getStrategyArgs(this.strategy.valueChanges).pipe(
            takeWhile(keepAlive)
        ).subscribe(args => this.selectedStrategyArgs = args);

        this.btNodeService.launchGetNodeList(observableOf(true));

        this.platformService.launchGetPlatformList(observableOf(true));

        this.strategyService.launchStrategyList(observableOf({ offset: -1, limit: -1, strategyType: -1, categoryType: -1, needArgsType: needArgsType.all }));

        this.subscription$$ = this.robotService.launchCreateRobot(
            this.create$.pipe(
                map(form => this.createSaveParams(form)),
                takeWhile(keepAlive)
            )
        );

        this.robotService.isSaveRobotSuccess().pipe(
            takeWhile(keepAlive)
        ).subscribe(isSuccess => {
            if (isSuccess) {
                this.form.reset();
                this.selectedPairs = [];
            }
        });

        this.isLoading = this.robotService.isLoading();

        this.robotService.handleSaveRobotError(keepAlive);

        this.strategyService.handleStrategyListError(keepAlive);

        this.btNodeService.handleNodeListError(keepAlive);

        this.platformService.handlePlatformListError(keepAlive);
    }

    /**
     * @ignore
     */
    private initForm() {
        this.form = this.fb.group({
            robotName: '',
            agent: null,
            strategy: null,
            kLinePeriod: null,
            platform: [null, Validators.required],
            stock: '',
        });
    }

    /**
     * 创建请求参数
     */
    private createSaveParams(formValue: RobotCreationForm): SaveRobotRequest {
        const { robotName, kLinePeriod, agent, strategy } = formValue;

        const { platform, stocks } = this.robotOperate.getPairsParams(this.selectedPairs);

        let args = '';

        if (this.selectedStrategyArgs) {
            concat(
                this.encrypt.transformStrategyArgsToEncryptType(observableOf(this.selectedStrategyArgs.semanticArgs || [])),
                this.encrypt.transformTemplateArgsToEncryptType(observableOf(this.selectedStrategyArgs.semanticTemplateArgs || []))
            ).pipe(
                reduce((acc, cur) => [...acc, ...cur], []),
                map(result => JSON.stringify(result))
            ).subscribe(result => args = result);
        }

        return { name: robotName, kLineId: kLinePeriod, nodeId: agent, args, strategyId: strategy, pairExchanges: platform, pairStocks: stocks };
    }

    /**
     * 处理参数变化
     */
    argChange(arg: VariableOverview, templateName?: string): void {
        if (!arg.variableName) return;

        if (templateName) {
            this.selectedStrategyArgs.semanticTemplateArgs.forEach(template => {
                const index = template.variables.findIndex(item => item.variableName === arg.variableName);

                if (index >= 0) template.variables[index] = arg;
            });
        } else {
            const index = this.selectedStrategyArgs.semanticArgs.findIndex(item => item.variableName === arg.variableName);

            if (index >= 0) this.selectedStrategyArgs.semanticArgs[index] = arg;
        }
    }

    /**
     * @ignore
     */
    get robotName(): AbstractControl {
        return this.form.get('robotName');
    }

    /**
     * @ignore
     */
    get kLinePeriod(): AbstractControl {
        return this.form.get('kLinePeriod');
    }

    /**
     * @ignore
     */
    get strategy(): AbstractControl {
        return this.form.get('strategy');
    }

    /**
     * @ignore
     */
    get agent(): AbstractControl {
        return this.form.get('agent');
    }

    /**
     * @ignore
     */
    get stock(): AbstractControl {
        return this.form.get('stock');
    }

    /**
     * @ignore
     */
    get platform(): AbstractControl {
        return this.form.get('platform');
    }

    /**
     * @ignore
     */
    get selectedPlatform(): Observable<Platform> {
        return this.platformService.getPlatformList().pipe(map(list => list.find(item => item.id === this.platform.value)));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }
}
