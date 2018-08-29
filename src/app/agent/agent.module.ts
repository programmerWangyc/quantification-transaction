import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { AgentAddComponent } from './agent-add/agent-add.component';
import { AgentListComponent } from './agent-list/agent-list.component';
import { routing } from './agent.routing';
import { AgentComponent } from './agent/agent.component';
import { CreateAgentComponent } from './create-agent/create-agent.component';
import { PIPES } from './pipes/index.pipe';
import { AgentConstantService } from './providers/agent.constant.service';

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
        AgentConstantService,
    ],
})
export class AgentModule { }
