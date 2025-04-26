import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { ExternalQuotesClientDialog, DashboardVariantsComponent } from './dashboardvariants.component';
import { DashboardVariantsRoutes } from './dashboardvariants.routing';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardVariantsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        AngularSignaturePadModule,
        PdfViewerModule,
    ],
    declarations: [DashboardVariantsComponent,ExternalQuotesClientDialog],
})

export class DashboardVariantsModule {}
