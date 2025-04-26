import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { LogsComponent } from './logs.component';
import { LogsRoutes } from './logs.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import {LogsRenderComponent, LogsDialog, LogsDialogDailyWork, LogsDialogTrade, LogsDialogEmployees, LogsDialogUser, LogsDialogProduct, LogsDialogProject,LogsDialogDailyReportImage, LogsDialogDailyReport, LogsDialogWeeklyReport} from './logsbutton-render.component';
import { NgxTextDiffModule } from 'ngx-text-diff';
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(LogsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxTextDiffModule
    ],
    declarations: [
        LogsComponent,
        LogsRenderComponent,
        LogsDialog,
        LogsDialogDailyWork,
        LogsDialogTrade,
        LogsDialogEmployees,
        LogsDialogUser,
        LogsDialogProject,
        LogsDialogDailyReport,
        LogsDialogWeeklyReport,
        LogsDialogProduct,
        LogsDialogDailyReportImage
    ]
})

export class LogsModule {}
