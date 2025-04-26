import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { APP_BASE_HREF, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {MatNativeDateModule} from '@angular/material/core';
import {MatButtonModule as MatButtonModule} from '@angular/material/button';
import {MatInputModule as MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule as MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule as MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule as MatRadioModule} from '@angular/material/radio';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatSliderModule as MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule as MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule as MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule as MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule as MatCardModule} from '@angular/material/card';
import {MatCheckboxModule as MatCheckboxModule} from '@angular/material/checkbox';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTabsModule as MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule as MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule as MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule as MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule as MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule as MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule as MatPaginatorModule} from '@angular/material/paginator';
import {MatRippleModule} from '@angular/material/core';

import { AppComponent } from './app.component';

import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { FixedpluginModule} from './shared/fixedplugin/fixedplugin.module';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';

import { AppRoutes } from './app.routing';

import { DatasourceService } from './services/datasource.service';

// import { NgxLoadingSpinnerModule } from '@k-adam/ngx-loading-spinner';

// import { AuthHelpers } from './services/auth-helpers.interceptor';

import { TagInputModule } from 'ngx-chips';

import { RoleChecker } from './services/role-checker.service';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import * as moment from 'moment';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatGoogleMapsAutocompleteModule} from '@angular-material-extensions/google-maps-autocomplete';
// import {AgmCoreModule} from '@agm/core';
import {MyService} from './services/image-upload-service'; 
import { NgxProgressOverlayModule } from 'ngx-progress-overlay';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { environment } from '../environments/environment';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { QuillModule } from 'ngx-quill'
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { HighchartsChartModule } from 'highcharts-angular';
import { GanttChartModule } from 'smart-webcomponents-angular/ganttchart';
import { DropDownListModule } from 'smart-webcomponents-angular/dropdownlist';
import { DataTablesModule } from 'angular-datatables';
import { NgxSpinnerModule } from "ngx-spinner";


@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    HttpClientModule,
    MatExpansionModule,
    DragDropModule,
    NgxMatSelectSearchModule,
    HighchartsChartModule,
    GanttChartModule,
    DropDownListModule,
    DataTablesModule
  ]
})
export class MaterialModule {}

@NgModule({
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot(AppRoutes, {
    useHash: true,
    
    // onSameUrlNavigation: 'reload'
}),
        HttpClientModule,
        TagInputModule,
        MaterialModule,
        SidebarModule,
        NavbarModule,
        FooterModule,
        FixedpluginModule,
        // NgxLoadingSpinnerModule.forRoot(),
        NgxMaterialTimepickerModule,
        NgxSpinnerModule.forRoot(),
        AngularEditorModule,
        // AgmCoreModule.forRoot({
        //     apiKey: 'AIzaSyBkCKCPyDH2g_pOSWtAo4XbCIIVe-p44mg',
        //     libraries: ['places']
        // }),
        MatGoogleMapsAutocompleteModule.forRoot('AIzaSyBkCKCPyDH2g_pOSWtAo4XbCIIVe-p44mg'),       
        NgxProgressOverlayModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireFunctionsModule,
        AngularSignaturePadModule,
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
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ]
            }
        }),
    ],
    declarations: [
        AppComponent,
        AdminLayoutComponent,
        AuthLayoutComponent
    ],
    providers: [
        MatNativeDateModule,
        DatasourceService,
        // {
        //     provide: HTTP_INTERCEPTORS, useClass: AuthHelpers, multi: true
        // },
        MyService,
        DatePipe,
        Clipboard
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
