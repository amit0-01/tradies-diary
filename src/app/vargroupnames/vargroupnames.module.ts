import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import {VarGroupNamesAddDialog,VarGroupNamesComponent } from './vargroupnames.component';
import { VarGroupNamesRoutes } from './vargroupnames.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ VarGroupNamesDeleteDialog,VarGroupNamesDialog,VarGroupNamesRenderComponent} from './vargroupnamesbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(VarGroupNamesRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        VarGroupNamesComponent,
        VarGroupNamesRenderComponent,
        VarGroupNamesDialog,
        VarGroupNamesAddDialog,
        VarGroupNamesDeleteDialog
    ]
})

export class VarGroupNamesModule {}
