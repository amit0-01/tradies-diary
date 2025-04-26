import { Routes } from '@angular/router';

import { ReportDailyComponent } from './reportdaily.component';

export const ReportDailyRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: ReportDailyComponent
    }]
}
];
