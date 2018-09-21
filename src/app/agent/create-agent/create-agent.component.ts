import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

import { merge, Observable, Subject, Subscription, of, combineLatest } from 'rxjs';
import { filter, mapTo, map, mergeMap, withLatestFrom } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { PublicService } from '../../providers/public.service';
import { SettingTypes } from '../../interfaces/request.interface';
import { DockerSetting } from '../../interfaces/response.interface';
import { TranslateService } from '@ngx-translate/core';
import { BtNodeService } from '../../providers/bt-node.service';
import { AgentConstantService } from '../providers/agent.constant.service';

@Component({
    selector: 'app-create-agent',
    templateUrl: './create-agent.component.html',
    styleUrls: ['./create-agent.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CreateAgentComponent extends BaseComponent {
    system: FormControl = new FormControl();

    version: FormControl = new FormControl();

    clientVersion: FormControl = new FormControl();

    download$: Subject<boolean> = new Subject();

    currentStep: Observable<number>;

    isOperateComplete: FormControl = new FormControl(false);

    subscription$$: Subscription;

    latestVersion: Observable<string>;

    private agentSetting: Observable<DockerSetting>;

    rpc: Observable<string>;

    skipStep$: Subject<number> = new Subject();

    constructor(
        private publicService: PublicService,
        private translate: TranslateService,
        private nodeService: BtNodeService,
        private constant: AgentConstantService,
    ) {
        super();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

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
            .add(this.nodeService.launchDownloadPackage(this.getDownloadUri()))
            .add(this.nodeService.launchNodeHash(of(true)));
    }

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

    private getDownloadUri(): Observable<string> {
        return this.download$.pipe(
            map(_ => this.constant.getClient(this.system.value, this.version.value, this.clientVersion.value)),
            filter(isFound => !!isFound),
            withLatestFrom(this.agentSetting),
            map(([{ href }, { base }]) => base + '/' + href)
        );
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
