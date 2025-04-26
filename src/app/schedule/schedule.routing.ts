import { Routes } from '@angular/router';

import { ScheduleComponent } from './schedule.component';
// import { WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
// import { SampleChangesGuard } from '../shared/unsaved-changes-guard';  

export const ScheduleRoutes: Routes = [
    {
        path: '',
        children: [ {
                path: '',
                component: ScheduleComponent,
                // canDeactivate: [SampleChangesGuard]
            },
            // {
            //     path: 'edit/:id',
            //     component: WeeklyReportEditComponent,
            //     // canDeactivate: [SampleChangesGuard]
            // }
        ]
    }
];
