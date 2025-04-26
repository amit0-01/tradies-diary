import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { VisitorsAddDialog, VisitorsComponent } from './visitors.component';
import { VisitorsRoutes } from './visitors.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ VisitorsDeleteDialog, VisitorsDialog, VisitorsRenderComponent} from './visitorsbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(VisitorsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        VisitorsComponent,
        VisitorsRenderComponent,
        VisitorsDialog,
        VisitorsAddDialog,
        VisitorsDeleteDialog
    ]
})

export class VisitorsModule {}
