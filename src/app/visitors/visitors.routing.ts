import { Routes } from '@angular/router';

import { VisitorsComponent } from './visitors.component';

export const VisitorsRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: VisitorsComponent
            }
        ]
    }
];
