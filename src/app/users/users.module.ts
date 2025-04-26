
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ChangeTimeDialogEdit, UserAddDialog,UsersComponent } from './users.component';
import { UsersRoutes } from './users.routing';

import { ModifyUserComponent } from './modifyuser/modifyuser.component';
// import{PriceDialog, ButtonRenderComponent} from './pricebutton-render.component';

//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ ChangeTimeDialog, UserDeleteDialog, UserDialog, UserPasswordDialog, UserRenderComponent} from './userbutton-render.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { SearchModule } from '../shared/search/search.module';

@NgModule({
    imports: [
        RouterModule.forChild(UsersRoutes),
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        TimepickerModule.forRoot(),
        SearchModule
    ],
    declarations: [
        UsersComponent,
        ModifyUserComponent,
        UserDialog,
        UserPasswordDialog,
        UserRenderComponent,
        UserAddDialog,
        UserDeleteDialog,
        ChangeTimeDialog,
        ChangeTimeDialogEdit
        // ButtonRenderComponent,
        // PriceDialog
    ]
})

export class UsersModule {}