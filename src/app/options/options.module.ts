import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { OptionsComponent } from './options.component';
import { OptionsRoutes } from './options.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(OptionsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
    ],
    declarations: [
        OptionsComponent,
    ]
})

export class OptionsModule {}
