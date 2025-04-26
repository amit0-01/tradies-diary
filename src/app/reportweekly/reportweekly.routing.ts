import { Routes } from '@angular/router';

import { ReportWeeklyComponent } from './reportweekly.component';

export const ReportWeeklyRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: ReportWeeklyComponent
    }]
}
];
