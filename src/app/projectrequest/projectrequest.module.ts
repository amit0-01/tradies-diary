import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ProjectRequestComponent } from './projectrequest.component';
import { ProjectRequestRoutes } from './projectrequest.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ProjectRequestRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxMatSelectSearchModule
    ],
    declarations: [
        ProjectRequestComponent,
    ]
})

export class ProjectRequestModule {}
