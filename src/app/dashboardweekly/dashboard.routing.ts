import { Routes } from '@angular/router';

import { DashboardWeeklyComponent } from './dashboard.component';

export const DashboardWeeklyRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardWeeklyComponent
    }]
}
];
