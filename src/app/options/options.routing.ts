import { Routes } from '@angular/router';

import { OptionsComponent } from './options.component';

export const OptionsRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: OptionsComponent
            }
        ]
    }
];
