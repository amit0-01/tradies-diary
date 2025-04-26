import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { StagesAddDialog, StagesComponent } from './stages.component';
import { StagesRoutes } from './stages.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ StagesDeleteDialog, StagesDialog, StagesRenderComponent} from './stagesbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(StagesRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        StagesComponent,
        StagesRenderComponent,
        StagesDialog,
        StagesAddDialog,
        StagesDeleteDialog
    ]
})

export class StagesModule {}
