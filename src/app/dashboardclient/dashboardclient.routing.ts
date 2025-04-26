import { Routes } from '@angular/router';

import { DashboardClientComponent } from './dashboardclient.component';

export const DashboardClientRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardClientComponent
    }]
}
];
