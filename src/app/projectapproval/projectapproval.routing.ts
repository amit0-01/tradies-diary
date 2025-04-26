import { Routes } from '@angular/router';

import { ProjectApprovalComponent } from './projectapproval.component';

export const ProjectApprovalRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: ProjectApprovalComponent
            }
        ]
    }
];
