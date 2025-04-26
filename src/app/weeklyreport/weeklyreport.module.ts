import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
// import { NgxImageCompressorModule } from 'ngx-image-compressor';

import { WeeklyReportSetWeatherDialog, WeeklyReportListVisitorDialog, WeeklyReportListTaskDialog, WeeklyReportListTradeTaskDialog, WeeklyReportImageDialog, WeeklyReportImageWorkerDialog, WeeklyReportComponent } from './weeklyreport.component';
import { WeeklyReportRoutes } from './weeklyreport.routing';
import { WeeklyReportEditSetWeatherDialog, WeeklyReportEditListVisitorDialog, WeeklyReportEditEmailClientDialog, WeeklyReportEditEmailAdminDialog, WeeklyReportEditListTaskDialog, WeeklyReportEditListTradeTaskDialog, WeeklyReportEditImageDialog, WeeklyReportEditImageWorkerDialog, WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
import { TagInputModule } from 'ngx-chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { environment } from '../../environments/environment';
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { QuillModule } from 'ngx-quill'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(WeeklyReportRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // NgxImageCompressorModule,
        TagInputModule,
        NgxMatSelectSearchModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireStorageModule,
        NgxProgressOverlayModule,
        ClipboardModule,
        AngularEditorModule,
        QuillModule.forRoot({
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }], 
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['clean'],  
                ]
            }
        })
    ],
    declarations: [
        WeeklyReportComponent,
        WeeklyReportEditComponent,
        WeeklyReportListTaskDialog,
        WeeklyReportListTradeTaskDialog,
        WeeklyReportImageDialog,
        WeeklyReportImageWorkerDialog,
        WeeklyReportEditListTaskDialog,
        WeeklyReportEditListTradeTaskDialog,
        WeeklyReportEditImageDialog,
        WeeklyReportEditImageWorkerDialog,
        WeeklyReportListVisitorDialog,
        WeeklyReportSetWeatherDialog,
        WeeklyReportEditListVisitorDialog,
        WeeklyReportEditEmailClientDialog,
        WeeklyReportEditEmailAdminDialog,
        WeeklyReportEditSetWeatherDialog
    ]
})

export class WeeklyReportModule {}
