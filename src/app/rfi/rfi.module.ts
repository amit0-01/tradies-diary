import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
// import { NgxImageCompressorModule } from 'ngx-image-compressor';
//import { WeeklyReportSetWeatherDialog, WeeklyReportListVisitorDialog, WeeklyReportListTaskDialog, WeeklyReportListTradeTaskDialog, WeeklyReportImageDialog, WeeklyReportImageWorkerDialog, WeeklyReportComponent } from './weeklyreport.component';
import { RFIRoutes } from './rfi.routing';
//import { WeeklyReportEditSetWeatherDialog, WeeklyReportEditListVisitorDialog, WeeklyReportEditEmailClientDialog, WeeklyReportEditEmailAdminDialog, WeeklyReportEditListTaskDialog, WeeklyReportEditListTradeTaskDialog, WeeklyReportEditImageDialog, WeeklyReportEditImageWorkerDialog, WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
import { TagInputModule } from 'ngx-chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from '../../environments/environment';
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { RFIPROJECTComponent } from './rfiproject/rfiproject.component';
import { RFICREATEPROJECTComponent, TableCreateItemsAddDialog, TableCreateItemsEditDialog, TableVarGroupNameAddDialog, UserAddOwnerDialog, VarGroupNamesAddDialog } from './rfiproject/rficreateproject/rficreateproject.component';
import { ApproveAdminDialog, ExternalQuotesEditDialog, RFIEDITCOMPONENTComponent, TableItemsAddDialog, TableItemsEditDialog, TableVarGroupNameAddEditDialog, UserAddOwnerDialogEdit } from './rfiproject/rfieditcomponent/rfieditcomponent.component';
import { RFIComponent } from './rfi.component';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import { QuillModule } from 'ngx-quill';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { RFIProjectDeleteDialog, RFIProjectRenderComponent } from './rfiproject/rfieditcomponent/rfiproject-render.component';
import { SearchModule } from "../shared/search/search.module";
import { PdfViewerModule } from 'ng2-pdf-viewer';



@NgModule({
    imports: [
    CommonModule,
    RouterModule.forChild(RFIRoutes),
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
    RFIComponent,
    RFIPROJECTComponent,
    RFICREATEPROJECTComponent,
    RFIEDITCOMPONENTComponent,
    UserAddOwnerDialog,
    TableCreateItemsAddDialog,
    TableVarGroupNameAddDialog,
    VarGroupNamesAddDialog,
    TableCreateItemsEditDialog,
    RFIProjectRenderComponent,
    RFIProjectDeleteDialog, 
    TableItemsEditDialog,
    TableItemsAddDialog,
    UserAddOwnerDialogEdit,
    TableVarGroupNameAddEditDialog,
    ApproveAdminDialog,
    ExternalQuotesEditDialog
  ]
})

export class RFIModule {}
