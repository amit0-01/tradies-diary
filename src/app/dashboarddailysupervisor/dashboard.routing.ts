import { Routes } from '@angular/router';

import { DashboardDailySupervisorComponent } from './dashboard.component';

export const DashboardDailyRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardDailySupervisorComponent
    }]
}
];
