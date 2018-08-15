import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { BBSTopicById } from '../../interfaces/response.interface';
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

        this.community.launchBBSTopicById(of({ id }));

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
}
