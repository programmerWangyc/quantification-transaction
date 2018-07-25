import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

import { merge, Observable, Subject, Subscription, of, combineLatest } from 'rxjs';
import { filter, mapTo, map, mergeMap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { PublicService } from '../../providers/public.service';
import { SettingTypes } from '../../interfaces/request.interface';
import { DockerSetting } from '../../interfaces/response.interface';
import { TranslateService } from '@ngx-translate/core';
import { BtNodeService } from '../../providers/bt-node.service';

@Component({
    selector: 'app-create-agent',
    templateUrl: './create-agent.component.html',
    styleUrls: ['./create-agent.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CreateAgentComponent extends BaseComponent {
    /**
     * 系统选择
     */
    system: FormControl = new FormControl();

    /**
     * 系统版本
     */
    version: FormControl = new FormControl();

    /**
     * client version
     */
    clientVersion: FormControl = new FormControl();

    /**
     * download
     */
    download$: Subject<boolean> = new Subject();

    /**
     * 当前的步骤
     */
    currentStep: Observable<number>;

    /**
     * 用户的操作是否已完成
     */
    isOperateComplete: FormControl = new FormControl(false);

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * 托管者最新的版本信息
     */
    latestVersion: Observable<string>;

    /**
     * docker setting
     */
    private agentSetting: Observable<DockerSetting>;

    /**
     * @ignore
     */
    rpc: Observable<string>;

    /**
     * 跳过指定的步骤
     */
    skipStep$: Subject<number> = new Subject();

    constructor(
        private publicService: PublicService,
        private translate: TranslateService,
        private nodeService: BtNodeService,
    ) {
        super();
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
        this.currentStep = this.getCurrentStep();

        this.agentSetting = this.publicService.getSetting(SettingTypes.docker).pipe(
            map(res => JSON.parse(res) as DockerSetting)
        );

        this.latestVersion = this.agentSetting.pipe(
            mergeMap(({ version, update }) => this.translate.get('AGENT_LATEST_VERSION', { version, time: update }))
        );

        this.rpc = combineLatest(
            this.agentSetting,
            this.nodeService.getNodeHash()
        ).pipe(
            map(([{ rpcBase }, hash]) => rpcBase + '/' + hash)
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.system.valueChanges
            .subscribe(_s => {
                this.version.reset();
                this.clientVersion.reset();
                this.isOperateComplete.reset();
            })
            .add(this.version.valueChanges.subscribe(_v => {
                this.clientVersion.reset();
                this.isOperateComplete.reset();
            }))
            .add(this.clientVersion.valueChanges.subscribe(_c => this.isOperateComplete.reset(false)))
            .add(this.nodeService.launchNodeHash(of(true)));
    }

    /**
     * 获取当前的步骤
     */
    private getCurrentStep(): Observable<number> {
        const systemReady = this.system.valueChanges.pipe(
            mapTo(1)
        );

        const versionReady = this.version.valueChanges.pipe(
            mapTo(2)
        );

        const clientReady = merge(
            this.download$,
            this.skipStep$.pipe(
                filter(step => step === 3)
            )
        ).pipe(
            mapTo(3)
        );

        const commandReady = this.isOperateComplete.valueChanges.pipe(
            filter(isSelected => isSelected),
            mapTo(4)
        );

        return merge(systemReady, versionReady, clientReady, commandReady);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
