import { Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgotpassword/forgotpassword.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { ProjectClientComponent } from './projectclient/projectclient.component';
import { ProjectLandingComponent } from './projectlanding/projectlanding.component';
import { ValidateCodeComponent } from './validatecode/validatecode.component';
import { ResetPasswordComponent } from './resetpassword/resetpassword.component';

export const PagesRoutes: Routes = [

    {
        path: '',
        children: [ {
            path: 'login',
            component: LoginComponent
        }, {
        //     path: 'lock',
        //     component: LockComponent
        // }, {
        //     path: 'register',
        //     component: RegisterComponent
        // }, {
            path: 'forgot-password',
            component: ForgotPasswordComponent
        }, {
        //     path: 'validate-code',
        //     component: ValidateCodeComponent
        // }, {
        //     path: 'reset-password',
        //     component: ResetPasswordComponent
        // }, {
            path: 'project-client',
            component: ProjectClientComponent
        }, {
            path: 'thank-you',
            component: ProjectLandingComponent
        }]
    }
];
