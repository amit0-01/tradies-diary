import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { NgxImageCompressorModule } from 'ngx-image-compressor';

import { ChangelogsComponent } from './changelogs.component';

//import { WeeklyReportSetWeatherDialog, WeeklyReportListVisitorDialog, WeeklyReportListTaskDialog, WeeklyReportListTradeTaskDialog, WeeklyReportImageDialog, WeeklyReportImageWorkerDialog, WeeklyReportComponent } from './weeklyreport.component';
import { ChangelogsRoutes } from './changelogs.routing';
//import { WeeklyReportEditSetWeatherDialog, WeeklyReportEditListVisitorDialog, WeeklyReportEditEmailClientDialog, WeeklyReportEditEmailAdminDialog, WeeklyReportEditListTaskDialog, WeeklyReportEditListTradeTaskDialog, WeeklyReportEditImageDialog, WeeklyReportEditImageWorkerDialog, WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
import { TagInputModule } from 'ngx-chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { environment } from '../../environments/environment';
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ChangelogsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NgxImageCompressorModule,
        TagInputModule,
        NgxMatSelectSearchModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireStorageModule,
        NgxProgressOverlayModule,
        ClipboardModule,
        AngularEditorModule,
    ],
    declarations: [
        ChangelogsComponent,
    ]
})

export class ChangelogsModule {}
