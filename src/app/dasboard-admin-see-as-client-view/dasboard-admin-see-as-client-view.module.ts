import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DasboardAdminSeeAsClientViewRoutingModule } from './dasboard-admin-see-as-client-view-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ClientDataComponent } from './client-data/client-data.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchModule } from "../shared/search/search.module";
import { DataTablesModule } from 'angular-datatables';



@NgModule({
  declarations: [
    DashboardComponent,
    ClientDataComponent
  ],
  imports: [
    CommonModule,
    DasboardAdminSeeAsClientViewRoutingModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    // Ng2SmartTableModule,
    MatTooltipModule,
    SearchModule,
    DataTablesModule
]
})
export class DasboardAdminSeeAsClientViewModule { }
