import { Routes } from '@angular/router';

import { DashboardNewComponent } from './dashboard.component';

export const DashboardNewRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DashboardNewComponent
    }]
}
];
