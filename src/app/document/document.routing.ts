import { RouterModule, Routes } from '@angular/router';

import { DocumentComponent } from './document/document.component';

const routs: Routes = [
    { path: '', component: DocumentComponent },
];

export const routing = RouterModule.forChild(routs);
