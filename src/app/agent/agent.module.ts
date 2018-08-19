import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { AgentListComponent } from './agent-list/agent-list.component';
import { CreateAgentComponent } from './create-agent/create-agent.component';
import { PIPES } from './pipes/index.pipe';
import { AgentService } from './providers/agent.service';
import { AgentConstantService } from './providers/agent.constant.service';
import { AgentComponent } from './agent/agent.component';
import { AgentAddComponent } from './agent-add/agent-add.component';
import { routing } from './agent.routing';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        routing,
    ],
    declarations: [
        AgentAddComponent,
        AgentComponent,
        AgentListComponent,
        CreateAgentComponent,
        PIPES,
    ],
    providers: [
        AgentService,
        AgentConstantService,
    ],
})
export class AgentModule { }
