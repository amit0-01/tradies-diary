import { Routes } from '@angular/router';

import { ProjectsComponent } from './projects.component';
import { ProjectsEditComponent } from './projectsedit/projectsedit.component';
import { ProjectsCreateComponent } from './projectscreate/projectscreate.component';
import { ProjectsViewComponent } from './projectsview/projectsview.component';

export const ProjectsRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: ProjectsComponent
            },
            {
                path: 'edit/:id',
                component: ProjectsEditComponent
            },
            {
                path: 'view/:id',
                component: ProjectsViewComponent
            },
            {
                path: 'create',
                component: ProjectsCreateComponent
            }
        ]
    }
];
