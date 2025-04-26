import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { SuppliersAddDialog, SuppliersComponent } from './suppliers.component';
import { SuppliersRoutes } from './suppliers.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ SuppliersDeleteDialog, SuppliersDialog, SuppliersRenderComponent} from './suppliersbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SuppliersRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        SuppliersComponent,
        SuppliersRenderComponent,
        SuppliersDialog,
        SuppliersAddDialog,
        SuppliersDeleteDialog
    ]
})

export class SuppliersModule {}
