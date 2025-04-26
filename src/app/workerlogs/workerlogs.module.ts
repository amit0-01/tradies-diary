import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { WorkerLogsComponent } from './workerlogs.component';
import { WorkerLogsRoutes } from './workerlogs.routing';
// import { Ng2SmartTableModule } from 'ng2-smart-table';
import { WorkerLogsDeleteDialog, WorkerLogsRenderComponent} from './workerlogsbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import{ WorkerLogsImageDialog, WorkerLogsImageRenderComponent } from './workerlogsimagebutton-render.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(WorkerLogsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        WorkerLogsComponent,
        WorkerLogsRenderComponent,
        WorkerLogsDeleteDialog,
        WorkerLogsImageDialog,
        WorkerLogsImageRenderComponent
    ]
})

export class WorkerLogsModule {}
