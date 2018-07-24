import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class AgentService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private errorService: ErrorService,
    ) { }

    //  =======================================================Serve Request=======================================================


    //  =======================================================Data acquisition=======================================================

    //  =======================================================UI state =======================================================

    //  =======================================================Local state change=======================================================

    //  =======================================================Error handler=======================================================
}
