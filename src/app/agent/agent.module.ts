import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { AgentListComponent } from './agent-list/agent-list.component';
import { PIPES } from './pipes/index.pipe';
import { AgentService } from './providers/agent.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
    ],
    declarations: [
        AgentListComponent,
        PIPES
    ],
    exports: [
        AgentListComponent
    ],
    providers: [
        AgentService,
    ]
})
export class AgentModule { }
