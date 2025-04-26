import { Routes } from '@angular/router';

import { UomComponent } from './uom.component';

export const UomRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: UomComponent
            }
        ]
    }
];
