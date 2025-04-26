import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { CostcentresAddDialog, CostcentresComponent } from './costcentres.component';
import { CostcentresRoutes } from './costcentres.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ CostcentresDeleteDialog, CostcentresDialog, CostcentresRenderComponent} from './costcentresbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(CostcentresRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        CostcentresComponent,
        CostcentresRenderComponent,
        CostcentresDialog,
        CostcentresAddDialog,
        CostcentresDeleteDialog
    ]
})

export class CostcentresModule {}
