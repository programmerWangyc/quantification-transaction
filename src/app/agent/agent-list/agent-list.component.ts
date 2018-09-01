import { Component } from '@angular/core';

import { Observable, of, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { TableStatistics } from '../../interfaces/app.interface';
import { SettingTypes } from '../../interfaces/request.interface';
import { BtNode, DockerSetting } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { PublicService } from '../../providers/public.service';
import { WatchDogService } from '../../shared/providers/watch-dog.service';

@Component({
    selector: 'app-agent-list',
    templateUrl: './agent-list.component.html',
    styleUrls: ['./agent-list.component.scss'],
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
    latestVersion: string;

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

    /**
     * statisticsParams
     */
    statisticsParams: Observable<TableStatistics>;

    /**
     * @ignore
     */
    pageSize = 20;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
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

        this.isLoading = this.nodeService.isLoading();

        this.statisticsParams = this.list.pipe(
            map(list => this.nodeService.getTableStatistics(list.length, this.pageSize))
        );
    }

    /**
     * @ignore
     */
    launch() {
        const keepAlive = () => this.isAlive;

        this.subscription$$ = this.wdService.launchSetWatchDog(this.setNodeWd$.asObservable())
            .add(this.nodeService.launchDeleteNode(this.delete$.asObservable()))
            .add(this.publicService.getSetting(SettingTypes.docker).pipe(
                map(res => JSON.parse(res) as DockerSetting),
                map(({ version }) => version)
            ).subscribe(version => this.latestVersion = version));

        this.nodeService.launchGetNodeList(of(true));

        this.nodeService.handleNodeListError(keepAlive);

        this.nodeService.handleDeleteNodeError(keepAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }

}
