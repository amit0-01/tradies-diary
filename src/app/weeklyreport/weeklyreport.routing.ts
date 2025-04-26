import { Routes } from '@angular/router';

import { WeeklyReportComponent } from './weeklyreport.component';
import { WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
// import { SampleChangesGuard } from '../shared/unsaved-changes-guard';  

export const WeeklyReportRoutes: Routes = [
    {
        path: '',
        children: [ {
                path: '',
                component: WeeklyReportComponent,
                // canDeactivate: [SampleChangesGuard]
            },
            {
                path: 'edit/:id',
                component: WeeklyReportEditComponent,
                // canDeactivate: [SampleChangesGuard]
            }
        ]
    }
];
