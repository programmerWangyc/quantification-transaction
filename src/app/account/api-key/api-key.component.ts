import { Component, OnInit, OnDestroy } from '@angular/core';
import { Breadcrumb, TableStatistics } from '../../interfaces/app.interface';
import { Observable, of } from 'rxjs';
import { ApiKeyService } from '../providers/api.key.service';
import { ApiKey } from '../../interfaces/response.interface';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-api-key',
    templateUrl: './api-key.component.html',
    styleUrls: ['./api-key.component.scss'],
})
export class ApiKeyComponent implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'API_KEY' }];

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    classMap = [
        'anticon-check-circle-o success',
        'anticon-close-circle-o fail',
    ];

    list: Observable<ApiKey[]>;

    pageSize = 20;

    statisticsParams: Observable<TableStatistics>;

    constructor(
        private apiKeyService: ApiKeyService,
    ) { }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    launch(): void {
        const keepAlive = () => this.isAlive;

        this.apiKeyService.launchGetApiKeyList(of(null));

        this.apiKeyService.handleApiKeyListError(keepAlive);

    }

    initialModel(): void {
        this.list = this.apiKeyService.getApiKeyListResult();

        this.statisticsParams = this.list.pipe(
            map(data => this.apiKeyService.getTableStatistics(data.length, this.pageSize))
        );
    }

    onCreate(): void {
        this.apiKeyService.launchCreateApiKey(of({ ip: '', permission: '' }));
    }
    /**
     * @ignore
     */
    onDelete(target: ApiKey): void {
        this.apiKeyService.launchDeleteApiKey(of({ id: target.id }));
    }

    /**
     * @ignore
     */
    onLock(target: ApiKey): void {
        const { id, status } = target;

        this.apiKeyService.launchLockApiKey(of({ id, status: Number(!status) }));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
