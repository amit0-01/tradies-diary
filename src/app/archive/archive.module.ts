import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ArchiveComponent } from './archive.component';
import { ArchiveRoutes } from './archive.routing';
// import { ChildComponent } from './../child/child.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ArchiveRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        Ng2SmartTableModule
    ],
    declarations: [ArchiveComponent],
})

export class ArchiveModule {}
