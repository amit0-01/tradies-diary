import { Routes } from '@angular/router';

import { ProjectRequestComponent } from './projectrequest.component';

export const ProjectRequestRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: ProjectRequestComponent
            }
        ]
    }
];
