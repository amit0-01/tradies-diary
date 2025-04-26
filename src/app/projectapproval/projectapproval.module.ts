import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ProjectApprovalComponent } from './projectapproval.component';
import { ProjectApprovalRoutes } from './projectapproval.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import{  ProjectApprovalDialog, ProjectApprovalRenderComponent} from './projectapprovalbutton-render.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ProjectApprovalRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxMatSelectSearchModule,
    ],
    declarations: [
        ProjectApprovalComponent,
        ProjectApprovalRenderComponent,
        ProjectApprovalDialog
    ]
})

export class ProjectApprovalModule {}
