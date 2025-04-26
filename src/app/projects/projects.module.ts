import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ProjectAddDialog, ProjectsComponent } from './projects.component';
import { ProjectsRoutes } from './projects.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ ProjectDeleteDialog, ProjectDialog, ProjectRenderComponent} from './projectbutton-render.component';
import { UserAddSupervisorEditDialog, UserAddOwnerEditDialog, UserAddWorkerEditDialog, ProjectsEditComponent } from './projectsedit/projectsedit.component';
import { ProjectsViewComponent } from './projectsview/projectsview.component';
import { UserAddSupervisorDialog, UserAddOwnerDialog, UserAddWorkerDialog, ProjectsCreateComponent } from './projectscreate/projectscreate.component';
import { TagInputModule } from 'ngx-chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {MatGoogleMapsAutocompleteModule} from '@angular-material-extensions/google-maps-autocomplete';
import { DataTablesModule } from 'angular-datatables';
import {MatTabsModule} from '@angular/material/tabs';



@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ProjectsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        TagInputModule,
        NgxMatSelectSearchModule,
        MatGoogleMapsAutocompleteModule,
        DataTablesModule,
        MatTabsModule
    ],
    declarations: [
        ProjectsComponent,
        ProjectRenderComponent,
        ProjectDialog,
        ProjectAddDialog,
        ProjectDeleteDialog,
        ProjectsEditComponent,
        ProjectsViewComponent,
        ProjectsCreateComponent,
        UserAddOwnerDialog,
        UserAddWorkerDialog,
        UserAddSupervisorDialog,
        UserAddSupervisorEditDialog,
        UserAddOwnerEditDialog,
        UserAddWorkerEditDialog
    ]
})

export class ProjectsModule {}
