import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ChangeTimeDialog, CostcentresAddDialog, EmployeesAddDialog, EmployeesComponent } from './employees.component';
import { EmployeesRoutes } from './employees.routing';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ChangeTimeDialogEdit, CostcentresAddDialogEdit, EmployeesDeleteDialog, EmployeesDialog, EmployeesRenderComponent} from './employeesbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(EmployeesRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        Ng2SmartTableModule,
        NgxCsvParserModule,
        NgxMatSelectSearchModule,
        NgxMaterialTimepickerModule,
        TimepickerModule.forRoot(),
    ],
    declarations: [
        EmployeesComponent,
        EmployeesRenderComponent,
        EmployeesDialog,
        EmployeesAddDialog,
        EmployeesDeleteDialog,
        CostcentresAddDialog,
        CostcentresAddDialogEdit,
        ChangeTimeDialog,
        ChangeTimeDialogEdit
    ]
})

export class EmployeesModule {}
