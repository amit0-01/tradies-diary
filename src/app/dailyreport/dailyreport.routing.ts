import { Routes } from '@angular/router';

import { DailyReportComponent } from './dailyreport.component';
import { DailyProjectComponent } from './dailyproject/dailyproject.component';
// import { SampleChangesGuard } from '../shared/unsaved-changes-guard';  

export const DailyReportRoutes: Routes = [
    {
        path: '',
        children: [ {
                path: '',
                component: DailyReportComponent
            },
            {
                path: 'project/:id',
                component: DailyProjectComponent,
                // canDeactivate: [SampleChangesGuard]
            }
        ]
    }
];
