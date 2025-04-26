import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardselectionsRoutingModule } from './dashboardselections-routing.module';
import { DashbordselectionsComponent } from './dashbordselections/dashbordselections.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
// import { Ng2SmartTableComponent, Ng2SmartTableModule } from 'ng2-smart-table';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ExternalQuotesClientDialog } from '../dashboardselections/dashbordselections/dashbordselections.component';


@NgModule({
  declarations: [
    DashbordselectionsComponent,
    ExternalQuotesClientDialog
  ],
  imports: [
    CommonModule,
    DashboardselectionsRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    AngularSignaturePadModule,
    PdfViewerModule,
    // Ng2SmartTableModule
  ]
})
export class DashboardselectionsModule { }
