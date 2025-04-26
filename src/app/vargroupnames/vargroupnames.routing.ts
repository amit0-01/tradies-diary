import { Routes } from '@angular/router';

import { VarGroupNamesComponent } from './vargroupnames.component';

export const VarGroupNamesRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: VarGroupNamesComponent
            }
        ]
    }
];
