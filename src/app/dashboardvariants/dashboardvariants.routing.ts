import { Routes } from '@angular/router';

import { DashboardVariantsComponent } from './dashboardvariants.component';

export const DashboardVariantsRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: ':id',
        component: DashboardVariantsComponent
    }]
}
];
