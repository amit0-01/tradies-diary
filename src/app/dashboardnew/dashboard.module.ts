import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { DashboardNewComponent } from './dashboard.component';
import { DashboardNewRoutes } from './dashboard.routing';
// import { ChildComponent } from './../child/child.component';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
// import{ DailyDeleteRenderComponent, DailyDeleteDialog} from './dailybutton-render.component';
// import{ WeeklyDeleteRenderComponent, WeeklyDeleteDialog} from './weeklybutton-render.component';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { GraphsComponent } from './graphs/graphs.component';
import { WorkerLogsImageDialog, WorkerLogsImageRenderComponent } from './workerlogsimagesbutton/workerlogsimagesbutton';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardNewRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxGalleryModule
    ],
    declarations: [
        DashboardNewComponent,
        GraphsComponent,
        WorkerLogsImageRenderComponent,
        WorkerLogsImageDialog
        // WorkerLogsImageRenderComponent
        // DailyProjectSelectDialog,
        // DailyDateSelectDialog,
        // DailyDeleteRenderComponent,
        // DailyDeleteDialog,
        // WeeklyDeleteRenderComponent,
        // WeeklyDeleteDialog
    ]
})

export class DashboardNewModule {}
