import { Routes } from '@angular/router';

import { ReasonsComponent } from './reasons.component';

export const ReasonsRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: ReasonsComponent
            }
        ]
    }
];
