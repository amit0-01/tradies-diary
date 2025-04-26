import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
// import { NgxImageCompressorModule } from 'ngx-image-compressor';

import { VariationsComponent } from './variations.component';
import { VariationsProjectComponent } from './variationsproject/variationsproject.component';
import { VarGroupNamesAddDialog, TableVarGroupNameAddDialog, UomCreateAddDialog, TableCreateItemsAddDialog, TableCreateItemsEditDialog, UserAddOwnerDialog, VariationsProjectCreateComponent } from './variationsproject/variationsprojectcreate/variationsprojectcreate.component';
import { VarGroupNamesAddEditDialog, TableVarGroupNameAddEditDialog, ApproveViewDialog, ApproveAdminDialog, ExternalQuotesEditDialog, UomAddDialog, TableItemsEditDialog, TableItemsAddDialog, UserAddOwnerDialogEdit, VariationsProjectEditComponent } from './variationsproject/variationsprojectedit/variationsprojectedit.component';
//import { WeeklyReportSetWeatherDialog, WeeklyReportListVisitorDialog, WeeklyReportListTaskDialog, WeeklyReportListTradeTaskDialog, WeeklyReportImageDialog, WeeklyReportImageWorkerDialog, WeeklyReportComponent } from './weeklyreport.component';
import { VariationsRoutes } from './variations.routing';
//import { WeeklyReportEditSetWeatherDialog, WeeklyReportEditListVisitorDialog, WeeklyReportEditEmailClientDialog, WeeklyReportEditEmailAdminDialog, WeeklyReportEditListTaskDialog, WeeklyReportEditListTradeTaskDialog, WeeklyReportEditImageDialog, WeeklyReportEditImageWorkerDialog, WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
import { TagInputModule } from 'ngx-chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { environment } from '../../environments/environment';
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { AngularEditorModule } from '@kolkov/angular-editor';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import { QuillModule } from 'ngx-quill'
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { VariationsProjectDeleteDialog, VariationsProjectRenderComponent } from './variationsproject/variationsproject-render.component';
import { SearchModule } from "../shared/search/search.module";

@NgModule({
    imports: [
    CommonModule,
    RouterModule.forChild(VariationsRoutes),
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
    // Ng2SmartTableModule,
    FileUploadModule,
    PdfViewerModule,
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
    }),
    SearchModule
],
    declarations: [
        VariationsComponent,
        VariationsProjectComponent,
        VariationsProjectCreateComponent,
        VariationsProjectEditComponent,
        UserAddOwnerDialog,
        UserAddOwnerDialogEdit,
        TableItemsAddDialog,
        TableItemsEditDialog,
        TableCreateItemsEditDialog,
        TableCreateItemsAddDialog,
        UomAddDialog,
        UomCreateAddDialog,
        ExternalQuotesEditDialog,
        VariationsProjectDeleteDialog,
        VariationsProjectRenderComponent,
        ApproveAdminDialog,
        ApproveViewDialog,
        TableVarGroupNameAddDialog,
        VarGroupNamesAddDialog,
        VarGroupNamesAddEditDialog,
        TableVarGroupNameAddEditDialog
    ], 
    exports :[
        TableItemsEditDialog
    ]
})

export class VariationsModule {}
