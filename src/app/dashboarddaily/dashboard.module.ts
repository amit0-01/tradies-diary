import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardDailyComponent, DailyProjectSelectDialog, DailyDateSelectDialog } from './dashboard.component';
import { DashboardDailyRoutes } from './dashboard.routing';
// import { ChildComponent } from './../child/child.component';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ DailyRenderComponent, DailyDeleteDialog} from './dailybutton-render.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardDailyRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule
    ],
    declarations: [
        DashboardDailyComponent,
        DailyProjectSelectDialog,
        DailyDateSelectDialog,
        DailyRenderComponent,
        DailyDeleteDialog
    ]
})

export class DashboardDailyModule {}
