import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashbordselectionsComponent } from './dashbordselections/dashbordselections.component';

const routes: Routes = [
    {
  
        path: '',
        children: [ {
          path: ':id',
          component: DashbordselectionsComponent
      }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardselectionsRoutingModule { }
