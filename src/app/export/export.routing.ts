import { Routes } from '@angular/router';

import { ExportComponent } from './export.component';

export const ExportRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: ExportComponent
            }
        ]
    }
];
