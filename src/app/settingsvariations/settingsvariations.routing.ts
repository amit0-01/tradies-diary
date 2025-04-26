import { Routes } from '@angular/router';

import { SettingsVariationsComponent } from './settingsvariations.component';

export const SettingsVariationsRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: SettingsVariationsComponent
            }
        ]
    }
];
