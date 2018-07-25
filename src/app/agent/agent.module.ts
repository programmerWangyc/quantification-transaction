import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { AgentListComponent } from './agent-list/agent-list.component';
import { CreateAgentComponent } from './create-agent/create-agent.component';
import { PIPES } from './pipes/index.pipe';
import { AgentService } from './providers/agent.service';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
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
    ],
})
export class AgentModule { }
