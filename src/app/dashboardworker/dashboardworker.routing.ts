import { Routes } from '@angular/router';

import { DashboardWorkerComponent } from './dashboardworker.component';

export const DashboardWorkerRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardWorkerComponent
    }]
}
];
