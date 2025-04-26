import { Routes } from '@angular/router';

import { DashboardWeeklySupervisorComponent } from './dashboard.component';

export const DashboardWeeklyRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardWeeklySupervisorComponent
    }]
}
];
