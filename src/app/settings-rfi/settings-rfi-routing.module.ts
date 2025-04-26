import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfiSettingComponent } from './rfi-setting/rfi-setting.component';

const routes: Routes = [
  {
    path : '',
    children : [{
      path : '',
      component : RfiSettingComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRfiRoutingModule { }
