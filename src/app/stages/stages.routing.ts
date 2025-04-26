import { Routes } from '@angular/router';

import { StagesComponent } from './stages.component';

export const StagesRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: StagesComponent
            }
        ]
    }
];
