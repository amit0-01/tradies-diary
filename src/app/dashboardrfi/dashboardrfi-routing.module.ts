import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardrfiComponent } from './dashboardrfi/dashboardrfi.component';

const routes: Routes = [
  {
    path: '',
    children : [{
      path : ':id',
      component : DashboardrfiComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardrfiRoutingModule { }
