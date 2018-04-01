import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContainerComponent } from './container/container.component';


const routs: Routes = [
    { path: '', component: ContainerComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routs),
    ],
    declarations: [],
    exports: [
        RouterModule
    ],
})
export class DocumentRoutingModule { }
