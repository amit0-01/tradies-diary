import { Routes } from '@angular/router';

import { ExportTradesComponent } from './export-trades.component';

export const ExportTradesRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: ExportTradesComponent
            }
        ]
    }
];
