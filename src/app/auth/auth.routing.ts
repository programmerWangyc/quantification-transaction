import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { ResetComponent } from './reset/reset.component';
import { SignupComponent } from './signup/signup.component';

const routs: Routes = [
    {
        path: '',
        component: AuthComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'signup', component: SignupComponent },
            { path: 'reset', component: ResetComponent },
            { path: 'pwd/:token', component: PasswordComponent },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    }
];


export const routing = RouterModule.forChild(routs);