import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import {ReasonsAddDialog,ReasonsComponent } from './reasons.component';
import {ReasonsRoutes } from './reasons.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ReasonsDeleteDialog,ReasonsDialog,ReasonsRenderComponent} from './reasonsbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ReasonsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        ReasonsComponent,
        ReasonsRenderComponent,
        ReasonsDialog,
        ReasonsAddDialog,
        ReasonsDeleteDialog
    ]
})

export class ReasonsModule {}
