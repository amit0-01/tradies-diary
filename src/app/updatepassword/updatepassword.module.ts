import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { UpdatePasswordComponent } from './updatepassword.component';
import { UpdatePasswordRoutes } from './updatepassword.routing';
// import { ChildComponent } from './../child/child.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UpdatePasswordRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        Ng2SmartTableModule
    ],
    declarations: [UpdatePasswordComponent],
})

export class UpdatePasswordModule {}
