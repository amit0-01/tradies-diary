import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardrfiRoutingModule } from './dashboardrfi-routing.module';
import { DashboardrfiComponent, ExternalQuotesClientDialog } from './dashboardrfi/dashboardrfi.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MaterialModule } from '../app.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';


@NgModule({
  declarations: [
    DashboardrfiComponent,
    ExternalQuotesClientDialog
  ],
  imports: [
    CommonModule,
    DashboardrfiRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    // Ng2SmartTableModule,
    PdfViewerModule,
    FormsModule,
    AngularSignaturePadModule
  ]
})
export class DashboardrfiModule { }
