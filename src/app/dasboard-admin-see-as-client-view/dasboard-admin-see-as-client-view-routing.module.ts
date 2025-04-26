import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientDataComponent } from './client-data/client-data.component';

const routes: Routes = [
  {
    path : '',
    component : DashboardComponent
  },
  {
    path : ':id',
    component : ClientDataComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DasboardAdminSeeAsClientViewRoutingModule { }
