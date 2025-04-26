import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
// import { NgxImageCompressorModule } from 'ngx-image-compressor';

import { SetDateDialog, DailyReportComponent } from './dailyreport.component';
import { DailyReportRoutes } from './dailyreport.routing';
import { TableTradesTaskEditDialog, TableTradesTaskAddDialog, TableTradesAddDialog, TableEmployeesTaskEditDialog, TableEmployeesTaskAddDialog, TableEmployeesAddDialog, TableVisitorEditDialog, TableVisitorAddDialog, ChangeTimeDialog, MultipleTradesAddDialog,MultipleEmployeesAddDialog, ReasonsAddDialog, StagesAddDialog, CategoriesAddDialog, SuppliersAddDialog, CostcentresAddDialog, DailyProjectAddMaterialsDialog, DailyProjectAddStagesDialog, TradeStaffAddDialog, StaffsAddDialog, TradesAddDialog,VisitorsAddDialog, DailyProjectComponent,TradeCategoriesAddDialog } from './dailyproject/dailyproject.component';
import { ChangeTimeDialog2, WorkersLogDialog, WorkerLogsDeleteDialog, WorkerLogsRenderComponent} from './dailyproject/workerlogs-render.component';
import { TagInputModule } from 'ngx-chips';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
// import{ DailyProjectDeleteMaterialsDialog, DailyProjectUpdateMaterialsDialog, DailyProjectMaterialsRenderComponent} from './dailyproject/dailyprojectmaterialsbutton-render.component';
// import{ DailyProjectDeleteStagesDialog, DailyProjectUpdateStagesDialog, DailyProjectStagesRenderComponent} from './dailyproject/dailyprojectstagesbutton-render.component';
import{ DailyProjectViewWorkerImageDialog, DailyProjectWorkerImageRenderComponent } from './dailyproject/dailyprojectworkerimagebutton-render.component';
import{ DailyProjectWorkerAcceptRenderComponent } from './dailyproject/dailyprojectworkeracceptbutton-render.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { JsonParsePipe  } from '../services/pretty-print.pipe';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { environment } from '../../environments/environment';
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DailyReportRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // NgxImageCompressorModule,
        TagInputModule,
        // Ng2SmartTableModule,
        NgxMaterialTimepickerModule,
        NgxMatSelectSearchModule,
        TimepickerModule.forRoot(),
        PopoverModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireStorageModule,
        NgxProgressOverlayModule,
    ],
    declarations: [
        DailyReportComponent,
        DailyProjectComponent,
        // DailyProjectDeleteMaterialsDialog,
        // DailyProjectUpdateMaterialsDialog,
        // DailyProjectMaterialsRenderComponent,
        DailyProjectAddMaterialsDialog,
        DailyProjectAddStagesDialog,
        // DailyProjectStagesRenderComponent,
        // DailyProjectUpdateStagesDialog,
        // DailyProjectDeleteStagesDialog,
        TradeStaffAddDialog,
        StaffsAddDialog,
        TradesAddDialog,
        VisitorsAddDialog,
        JsonParsePipe,
        DailyProjectWorkerImageRenderComponent,
        DailyProjectWorkerAcceptRenderComponent,
        DailyProjectViewWorkerImageDialog,
        TradeCategoriesAddDialog,
        SuppliersAddDialog,
        CategoriesAddDialog,
        CostcentresAddDialog,
        StagesAddDialog,
        ReasonsAddDialog,
        MultipleTradesAddDialog,
        MultipleEmployeesAddDialog,
        ChangeTimeDialog,
        ChangeTimeDialog2,
        WorkerLogsRenderComponent,
        WorkersLogDialog,
        WorkerLogsDeleteDialog,
        SetDateDialog,
        TableVisitorAddDialog,
        TableVisitorEditDialog,
        TableEmployeesAddDialog,
        TableEmployeesTaskAddDialog,
        TableEmployeesTaskEditDialog,
        TableTradesAddDialog,
        TableTradesTaskAddDialog,
        TableTradesTaskEditDialog
    ]
})

export class DailyReportModule {}
