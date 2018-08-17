import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { BaseGuard } from '../../dashboard/providers/guard.service';
import { BBSTopicById } from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { CommunityService } from './community.service';

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
     */
    private checkExistTopic(id: number): void {
        this.community.getBBSTopicByIdResponseState().pipe(
            take(1)
        ).subscribe(state => {
            if (!state || state.result.id !== id) {
                this.community.launchBBSTopicById(of({ id }));
            } else {
                // do nothing;
            }
        });
    }
}


@Injectable()
export class FormContentGuard extends BaseGuard {
    constructor(
        public tipService: TipService,
    ) {
        super(tipService);
    }
}
