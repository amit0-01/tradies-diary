import { Routes } from '@angular/router';

import { CostcentresComponent } from './costcentres.component';

export const CostcentresRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: CostcentresComponent
            }
        ]
    }
];
