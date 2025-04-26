import { Routes } from '@angular/router';

import { WorkerLogsComponent } from './workerlogs.component';

export const WorkerLogsRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: WorkerLogsComponent
            }
        ]
    }
];
