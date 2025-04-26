import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardClientComponent } from './dashboardclient.component';
import { DashboardClientRoutes } from './dashboardclient.routing';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MatSelectModule } from '@angular/material/select';
import { ExpandableRowComponent } from './expandable-row.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardClientRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        MatSelectModule, 
        MatIconModule
    ],
    declarations: [DashboardClientComponent, ExpandableRowComponent],
})

export class DashboardClientModule {}
