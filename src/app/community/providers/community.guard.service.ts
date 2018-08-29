import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { BBSTopicById } from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { CommunityService } from './community.service';
import { BaseGuard } from '../../base/guard.service';
import { RoutingService } from '../../providers/routing.service';

@Injectable()
export class TopicResolver implements Resolve<BBSTopicById> {

    constructor(
        private community: CommunityService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<BBSTopicById> {
        const id = +route.paramMap.get('id');

        this.checkExistTopic(id);

        return this.community.getBBSTopic().pipe(
            take(1),
            map(res => {
                if (res) {
                    return res;
                } else {
                    this.router.navigate(['../../'], { relativeTo: this.activatedRoute });

                    return null;
                }
            })
        );
    }

    /**
     * 1、检查是否获取过topic
     * 2、从主页进入时需要先获取；
     * 3、从详情页进入时不应该再获取。
     * 4、路由id和当前的 store 中的 bbs topic by id 响应 id不一致时，重置响应数据；
     */
    private checkExistTopic(id: number): void {
        this.community.getBBSTopicByIdResponseState().pipe(
            take(1)
        ).subscribe(state => {
            if (!state || state.result.id !== id) {
                this.community.launchBBSTopicById(of({ id }));
            }

            if (!!state && state.result.id !== id) {
                this.community.resetTopicState();
            }
        });
    }
}


@Injectable()
export class FormContentGuard extends BaseGuard {
    constructor(
        public tipService: TipService,
        public routing: RoutingService,
    ) {
        super(tipService, routing);
    }
}
