import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
// import { NgxImageCompressorModule } from 'ngx-image-compressor';
import { SelectionsComponent } from './selections.component';

//import { WeeklyReportSetWeatherDialog, WeeklyReportListVisitorDialog, WeeklyReportListTaskDialog, WeeklyReportListTradeTaskDialog, WeeklyReportImageDialog, WeeklyReportImageWorkerDialog, WeeklyReportComponent } from './weeklyreport.component';
import { SelectionsRoutes } from './selections.routing';
//import { WeeklyReportEditSetWeatherDialog, WeeklyReportEditListVisitorDialog, WeeklyReportEditEmailClientDialog, WeeklyReportEditEmailAdminDialog, WeeklyReportEditListTaskDialog, WeeklyReportEditListTradeTaskDialog, WeeklyReportEditImageDialog, WeeklyReportEditImageWorkerDialog, WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
import { TagInputModule } from 'ngx-chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { environment } from '../../environments/environment';
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { AngularEditorModule } from '@kolkov/angular-editor';
import {  SelectionsProjectRenderComponent , SelectionsProjectDeleteDialog} from './selectionsproject/selectionsproject-render.component';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';

import { QuillModule } from 'ngx-quill';
import { SelectionsprojectcreateComponent, TableCreateItemsAddDialog, TableCreateItemsEditDialog, TableVarGroupNameAddDialog, UomCreateAddDialog, UserAddOwnerDialog, VarGroupNamesAddDialog } from './selectionsproject/selectionsprojectcreate/selectionsprojectcreate.component';
import { ApproveAdminDialog, ApproveViewDialog, ExternalQuotesEditDialog, SelectionsprojecteditComponent, TableItemsAddDialog, TableItemsEditDialog, TableVarGroupNameAddEditDialog, UomAddDialog, UserAddOwnerDialogEdit, VarGroupNamesAddEditDialog,  } from './selectionsproject/selectionsprojectedit/selectionsprojectedit.component';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SelectionsProjectComponent } from './selectionsproject/selectionsproject.component';
import { SearchModule } from "../shared/search/search.module";





@NgModule({
    imports: [
    CommonModule,
    RouterModule.forChild(SelectionsRoutes),
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    MaterialModule,
    // NgxImageCompressorModule,
    TagInputModule,
    NgxMatSelectSearchModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    NgxProgressOverlayModule,
    ClipboardModule,
    AngularEditorModule,
    FileUploadModule,
    // Ng2SmartTableModule,
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
           SelectionsComponent,
           SelectionsProjectComponent,
           SelectionsprojectcreateComponent,
         SelectionsprojecteditComponent,
        TableCreateItemsAddDialog,
         TableCreateItemsEditDialog,
         UserAddOwnerDialog,
        UomCreateAddDialog,
       TableVarGroupNameAddDialog,
        VarGroupNamesAddDialog,
       ApproveAdminDialog,
        ApproveViewDialog,
        TableItemsAddDialog,
        TableVarGroupNameAddEditDialog,
        UomAddDialog,
        ExternalQuotesEditDialog,
         VarGroupNamesAddEditDialog,
        SelectionsProjectDeleteDialog,
       SelectionsProjectRenderComponent,
       TableItemsEditDialog,
       UserAddOwnerDialogEdit
        
        
    ]
})

export class SelectionsModule {}
