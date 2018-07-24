import { Component } from '@angular/core';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { SettingTypes } from '../../interfaces/request.interface';
import { BtNode, DockerSetting } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { PublicService } from '../../providers/public.service';
import { WatchDogService } from '../../shared/providers/watch-dog.service';
import { AgentService } from '../providers/agent.service';

@Component({
    selector: 'app-agent-list',
    templateUrl: './agent-list.component.html',
    styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent extends BaseComponent {
    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * source data of agents;
     */
    list: Observable<BtNode[]>;

    /**
     * @ignore
     */
    tableHead: string[] = ['ID', 'IP_ADDRESS', 'OPERATE_SYSTEM', 'ROBOT', 'VERSION', 'STATUS', 'LATEST_COMMUNICATE', 'OPERATE'];

    /**
     * Latest version
     */
    latestVersion: Observable<string>;

    /**
     * 删除
     */
    delete$: Subject<BtNode> = new Subject();

    /**
     * 监控托管者
     */
    setNodeWd$: Subject<BtNode> = new Subject();

    /**
     * 是否正在加载托管者列表
     */
    isLoading: Observable<boolean>;

    constructor(
        private agentService: AgentService,
        private nodeService: BtNodeService,
        private publicService: PublicService,
        private wdService: WatchDogService,
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
        this.list = this.nodeService.getNodeList().pipe(
            map(nodes => nodes.filter(node => node.is_owner))
        );

        this.latestVersion = this.publicService.getSetting(SettingTypes.docker).pipe(
            map(res => JSON.parse(res) as DockerSetting),
            map(({ version }) => version)
        );

        this.isLoading = this.nodeService.isLoading();
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.nodeService.handleNodeListError()
            .add(this.nodeService.handleDeleteNodeError())
            .add(this.wdService.launchSetWatchDog(this.setNodeWd$))
            .add(this.nodeService.launchDeleteNode(this.delete$))
            .add(this.publicService.launchGetSettings(SettingTypes.docker))
            .add(this.nodeService.launchGetNodeList(of(true), true));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
