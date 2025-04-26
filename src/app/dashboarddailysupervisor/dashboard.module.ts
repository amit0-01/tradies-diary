import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardDailySupervisorComponent, DailyProjectSelectDialog } from './dashboard.component';
import { DashboardDailyRoutes } from './dashboard.routing';
// import { ChildComponent } from './../child/child.component';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ DailyRenderSupervisorComponent, DailyDeleteDialog} from './dailybutton-render.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardDailyRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxMatSelectSearchModule
    ],
    declarations: [
        DashboardDailySupervisorComponent,
        DailyProjectSelectDialog,
        DailyRenderSupervisorComponent,
        DailyDeleteDialog
    ]
})

export class DashboardDailySupervisorModule {}
