import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardWeeklySupervisorComponent, DailyProjectSelectDialog } from './dashboard.component';
import { DashboardWeeklyRoutes } from './dashboard.routing';
// import { ChildComponent } from './../child/child.component';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ WeeklyRenderSupervisorComponent, WeeklyDeleteDialog} from './weeklybutton-render.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardWeeklyRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxMatSelectSearchModule
    ],
    declarations: [
        DashboardWeeklySupervisorComponent,
        DailyProjectSelectDialog,
        WeeklyRenderSupervisorComponent,
        WeeklyDeleteDialog
    ]
})

export class DashboardWeeklySupervisorModule {}
