import 'rxjs/add/operator/concat';

import { Location } from '@angular/common';
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { ExchangePairBusinessComponent } from '../../interfaces/business.interface';
import { Breadcrumb, RobotCreationForm, SelectedPair, VariableOverview } from '../../interfaces/constant.interface';
import { CategoryType, needArgsType, SaveRobotRequest } from '../../interfaces/request.interface';
import { Platform } from '../../interfaces/response.interface';
import { BtNodeService, GroupedNode } from '../../providers/bt-node.service';
import { K_LINE_PERIOD } from '../../providers/constant.service';
import { EncryptService } from '../../providers/encrypt.service';
import { PlatformService } from '../../providers/platform.service';
import { RobotOperateService } from '../providers/robot.operate.service';
import { RobotService } from '../providers/robot.service';
import { SemanticArg, StrategyService } from '../providers/strategy.service';

@Component({
    selector: 'app-create-robot',
    templateUrl: './create-robot.component.html',
    styleUrls: ['./create-robot.component.scss']
})
export class CreateRobotComponent extends ExchangePairBusinessComponent {
    labelSm = 6;

    controlSm = 14;

    xs = 24;

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'ROBOT', path: '../../' }, { name: 'CREATE_ROBOT' }];

    subscription$$: Subscription;

    form: FormGroup;

    periods = K_LINE_PERIOD;

    platforms: Platform[] = [];

    isCustomStock = false;

    selectedPairs: SelectedPair[] = [];

    create$: Subject<RobotCreationForm> = new Subject();

    create$$: Subscription;

    agents: Observable<GroupedNode[]>;

    strategies: Observable<any>;

    /**
     * FIXME: selectAgent, selectedStrategy, selectedKLine, selectedExchange 实际是没有用的，
     * 但是去掉后 nzPlaceholder 无法正确显示，貌似是 ng-zorro 的一个BUG。
     **/
    selectedAgent = null;

    selectedKLine = null;

    selectedStrategy = null;

    selectedExchange = null;

    selectedStrategy$: Subject<number> = new Subject();

    selectedStrategyArgs: SemanticArg = null;

    constructor(
        private fb: FormBuilder,
        private platformService: PlatformService,
        private robotOperate: RobotOperateService,
        private btNodeService: BtNodeService,
        private strategyService: StrategyService,
        private location: Location,
        private robotService: RobotService,
        private encrypt: EncryptService,
        public eleRef: ElementRef,
        public render: Renderer2,
    ) {
        super(render, eleRef);
        this.initForm();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.agents = this.btNodeService.getGroupedNodeList('public', this.btNodeService.getAgentName);

        this.strategies = this.strategyService.getGroupedStrategy('category', this.strategyService.getCategoryName, this.strategyService.reverseGetCategoryName)
            .map(list => list.map(({ groupName, values, groupNameValue }) => ({
                groupName,
                groupNameValue,
                values: values.filter(item => item.is_owner && item.category !== CategoryType.TEMPLATE_SNAPSHOT || item.category < CategoryType.TEMPLATE_LIBRARY)
            }))
                .filter(list => !isEmpty(list.values))
            );
    }

    launch() {
        /**
         * @description Be careful ensure observables that emit 'complete' notification added at last;
         */
        this.subscription$$ = this.platformService.getPlatformList().subscribe(list => this.platforms = list)
            .add(this.strategyService.getStrategyArgs(this.selectedStrategy$).subscribe(args => this.selectedStrategyArgs = args))
            // .add(this.robotService.launchCreateRobot(this.create$.map(form => this.createSaveParams(form))))
            .add(this.btNodeService.launchGetNodeList(Observable.of(true)))
            .add(this.platformService.launchGetPlatformList(Observable.of(true)))
            .add(this.strategyService.launchStrategy(Observable.of({ offset: -1, limit: -1, strategyType: -1, categoryType: -1, needArgsType: needArgsType.all })));

        // FIXME: 这行加到上面时在组件销毁时没有取消掉, 然后每次进入时就会多出一条同步信息的流。why?
        this.create$$ = this.robotService.launchCreateRobot(this.create$.map(form => this.createSaveParams(form)));
    }

    initForm() {
        this.form = this.fb.group({
            robotName: '',
            agent: '',
            strategy: '',
            kLinePeriod: '',
            platform: ['', Validators.required],
            stock: '',
        })
    }

    createSaveParams(formValue: RobotCreationForm): SaveRobotRequest {
        const { robotName, kLinePeriod, agent, strategy } = formValue;

        const { platform, stocks } = this.robotOperate.getPairsParams(this.selectedPairs);

        let args = '';

        if (this.selectedStrategyArgs) {
            this.encrypt.transformStrategyArgsToEncryptType(Observable.of(this.selectedStrategyArgs.semanticArgs || []))
                .concat(this.encrypt.transformTemplateArgsToEncryptType(Observable.of(this.selectedStrategyArgs.semanticTemplateArgs || [])))
                .reduce((acc, cur) => [...acc, ...cur], [])
                .map(result => JSON.stringify(result))
                .subscribe(result => args = result);
        }

        return { name: robotName, kLineId: kLinePeriod, nodeId: agent, args, strategyId: strategy, pairExchanges: platform, pairStocks: stocks };
    }

    argChange(arg: VariableOverview, templateName?: string): void {
        if (!arg.variableName) return;

        if (templateName) {
            this.selectedStrategyArgs.semanticTemplateArgs.forEach(template => {
                let index = template.variables.findIndex(item => item.variableName === arg.variableName);

                if (index >= 0) template.variables[index] = arg;
            });
        } else {
            const index = this.selectedStrategyArgs.semanticArgs.findIndex(item => item.variableName === arg.variableName);

            if (index >= 0) this.selectedStrategyArgs.semanticArgs[index] = arg;
        }
    }

    goBack() {
        this.location.back();
    }

    get robotName(): AbstractControl {
        return this.form.get('robotName');
    }

    get kLinePeriod(): AbstractControl {
        return this.form.get('kLinePeriod');
    }

    get agent(): AbstractControl {
        return this.form.get('agent');
    }

    get stock(): AbstractControl {
        return this.form.get('stock');
    }

    get platform(): AbstractControl {
        return this.form.get('platform');
    }

    get selectedPlatform(): Observable<Platform> {
        return this.platformService.getPlatformList().map(list => list.find(item => item.id === this.platform.value));
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.create$$.unsubscribe();
    }
}
