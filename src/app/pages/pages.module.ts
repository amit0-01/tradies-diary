import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { FlexLayoutModule } from '@angular/flex-layout';

import { PagesRoutes } from './pages.routing';

import { RegisterComponent } from './register/register.component';
import { PricingComponent } from './pricing/pricing.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgotpassword/forgotpassword.component';
import { ValidateCodeComponent } from './validatecode/validatecode.component';
import { ResetPasswordComponent } from './resetpassword/resetpassword.component';
import { ProjectClientComponent } from './projectclient/projectclient.component';
import {MatGoogleMapsAutocompleteModule} from '@angular-material-extensions/google-maps-autocomplete';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PagesRoutes),
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    MatGoogleMapsAutocompleteModule,
    AngularSignaturePadModule 
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    PricingComponent,
    LockComponent,
    ProjectClientComponent,
    ForgotPasswordComponent,
    ValidateCodeComponent,
    ResetPasswordComponent
  ]
})

export class PagesModule {}
