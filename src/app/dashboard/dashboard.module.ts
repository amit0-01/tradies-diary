import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardComponent, DailyProjectSelectDialog, DailyDateSelectDialog } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';
// import { ChildComponent } from './../child/child.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ DailyDeleteRenderComponent, DailyDeleteDialog} from './dailybutton-render.component';
import{ WeeklyDeleteRenderComponent, WeeklyDeleteDialog} from './weeklybutton-render.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        Ng2SmartTableModule
    ],
    declarations: [
        DashboardComponent,
        DailyProjectSelectDialog,
        DailyDateSelectDialog,
        DailyDeleteRenderComponent,
        DailyDeleteDialog,
        WeeklyDeleteRenderComponent,
        WeeklyDeleteDialog
    ]
})

export class DashboardModule {}
