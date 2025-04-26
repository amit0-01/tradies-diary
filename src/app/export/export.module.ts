import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ExportComponent } from './export.component';
import { ExportRoutes } from './export.routing';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ExportRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NgxMatSelectSearchModule
    ],
    declarations: [
        ExportComponent,
    ]
})

export class ExportModule {}
