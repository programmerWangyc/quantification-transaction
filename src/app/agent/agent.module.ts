import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { AgentListComponent } from './agent-list/agent-list.component';
import { CreateAgentComponent } from './create-agent/create-agent.component';
import { PIPES } from './pipes/index.pipe';
import { AgentService } from './providers/agent.service';
import { RouterModule } from '@angular/router';
import { AgentConstantService } from './providers/agent.constant.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [
        AgentListComponent,
        PIPES,
        CreateAgentComponent,
    ],
    exports: [
        AgentListComponent,
        CreateAgentComponent,
    ],
    providers: [
        AgentService,
        AgentConstantService,
    ],
})
export class AgentModule { }
