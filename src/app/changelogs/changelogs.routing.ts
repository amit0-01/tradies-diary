import { Routes } from '@angular/router';

import { ChangelogsComponent } from './changelogs.component';
// import { WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
// import { SampleChangesGuard } from '../shared/unsaved-changes-guard';  

export const ChangelogsRoutes: Routes = [
    {
        path: '',
        children: [ {
                path: '',
                component: ChangelogsComponent,
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
