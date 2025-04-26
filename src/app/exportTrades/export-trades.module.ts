import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ExportTradesComponent } from './export-trades.component';
import { ExportTradesRoutes } from './export-trades.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ExportTradesRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxMatSelectSearchModule
    ],
    declarations: [
        ExportTradesComponent,
    ]
})

export class ExportTradesModule {}
