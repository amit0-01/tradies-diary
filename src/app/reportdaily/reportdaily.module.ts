import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ReportDailyComponent } from './reportdaily.component';
import { ReportDailyRoutes } from './reportdaily.routing';
// import { ChildComponent } from './../child/child.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ReportDailyRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        Ng2SmartTableModule
    ],
    declarations: [ReportDailyComponent],
})

export class ReportDailyModule {}
