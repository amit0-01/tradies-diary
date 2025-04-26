import { Routes } from '@angular/router';

import { DashboardSupervisorComponent } from './dashboardsupervisor.component';

export const DashboardSupervisorRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardSupervisorComponent
    }]
}
];
