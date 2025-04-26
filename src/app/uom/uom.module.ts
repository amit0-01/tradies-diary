import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { UomAddDialog, UomComponent } from './uom.component';
import { UomRoutes } from './uom.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ UomDeleteDialog, UomDialog, UomRenderComponent} from './uombutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UomRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        UomComponent,
        UomRenderComponent,
        UomDialog,
        UomAddDialog,
        UomDeleteDialog
    ]
})

export class UomModule {}
