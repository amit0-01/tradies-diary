import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardSupervisorComponent } from './dashboardsupervisor.component';
import { DashboardSupervisorRoutes } from './dashboardsupervisor.routing';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxGalleryModule } from 'ngx-gallery-9';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardSupervisorRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxGalleryModule
    ],
    declarations: [DashboardSupervisorComponent],
})

export class DashboardSupervisorModule {}
