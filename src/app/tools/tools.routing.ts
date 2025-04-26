import { Routes } from '@angular/router';

import { ToolsComponent } from './tools.component';

export const ToolsRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: ToolsComponent
            }
        ]
    }
];
