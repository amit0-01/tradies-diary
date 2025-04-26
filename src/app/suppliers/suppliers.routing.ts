import { Routes } from '@angular/router';

import { SuppliersComponent } from './suppliers.component';

export const SuppliersRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: SuppliersComponent
            }
        ]
    }
];
