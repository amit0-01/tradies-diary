import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ChangeTimeDialog,TimeDeleteDialog, DashboardWorkerComponent } from './dashboardworker.component';
import { DashboardWorkerRoutes } from './dashboardworker.routing';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TagInputModule } from 'ngx-chips';
// import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { environment } from '../../environments/environment';
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardWorkerRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        TagInputModule,
        // NgxMaterialTimepickerModule,
        TimepickerModule.forRoot(),
        PopoverModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireStorageModule,
        NgxProgressOverlayModule
    ],
    declarations: [DashboardWorkerComponent, ChangeTimeDialog, TimeDeleteDialog]
})

export class DashboardWorkerModule {}
