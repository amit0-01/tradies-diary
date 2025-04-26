import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardWeeklyComponent, DailyProjectSelectDialog, DailyDateSelectDialog } from './dashboard.component';
import { DashboardWeeklyRoutes } from './dashboard.routing';
// import { ChildComponent } from './../child/child.component';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ WeeklyRenderComponent, WeeklyDeleteDialog} from './weeklybutton-render.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardWeeklyRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule
    ],
    declarations: [
        DashboardWeeklyComponent,
        DailyProjectSelectDialog,
        DailyDateSelectDialog,
        WeeklyRenderComponent,
        WeeklyDeleteDialog
    ]
})

export class DashboardWeeklyModule {}
