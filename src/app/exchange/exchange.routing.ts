import { RouterModule, Routes } from '@angular/router';
import { ExchangeComponent } from './exchange/exchange.component';
import { ExchangeAddComponent } from './exchange-add/exchange-add.component';
import { ExchangeEditComponent } from './exchange-edit/exchange-edit.component';

const routs: Routes = [
    { path: '', component:  ExchangeComponent },
    { path: 'add', component: ExchangeAddComponent },
    { path: 'edit/:id', component: ExchangeEditComponent },
];

export const routing = RouterModule.forChild(routs);
