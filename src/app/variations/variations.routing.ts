import { Routes } from '@angular/router';

import { VariationsComponent } from './variations.component';
import { VariationsProjectComponent } from './variationsproject/variationsproject.component';
import { VariationsProjectCreateComponent } from './variationsproject/variationsprojectcreate/variationsprojectcreate.component';
import { VariationsProjectEditComponent } from './variationsproject/variationsprojectedit/variationsprojectedit.component';
// import { SampleChangesGuard } from '../shared/unsaved-changes-guard';  

export const VariationsRoutes: Routes = [
    {
        path: '',
        children: [ {
                path: '',
                component: VariationsComponent,
                // canDeactivate: [SampleChangesGuard]
            },
            {
                path: 'project/:id',
                component: VariationsProjectComponent,
                // canDeactivate: [SampleChangesGuard]
            },
            {
                path: 'project/:id/create',
                component: VariationsProjectCreateComponent,
                // canDeactivate: [SampleChangesGuard]
            },
            {
                path: 'project/:id/edit/:id2',
                component: VariationsProjectEditComponent,
                // canDeactivate: [SampleChangesGuard]
            }
        ]
    }
];
