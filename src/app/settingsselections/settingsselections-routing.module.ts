import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectionSettingComponent } from './selection-setting/selection-setting.component';

const routes: Routes = [
  {
    path: '',
    children : [{
      path : '',
      component : SelectionSettingComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsselectionsRoutingModule { }
