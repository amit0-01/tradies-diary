import { Routes } from '@angular/router';

import { SettingsAdminComponent } from './settingsadmin.component';

export const SettingsAdminRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: SettingsAdminComponent
            }
        ]
    }
];
