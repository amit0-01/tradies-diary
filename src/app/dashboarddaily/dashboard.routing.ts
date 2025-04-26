import { Routes } from '@angular/router';

import { DashboardDailyComponent } from './dashboard.component';

export const DashboardDailyRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardDailyComponent
    }]
}
];
