import { Routes } from '@angular/router';

import { SelectionsComponent } from './selections.component';
import { SelectionsprojectcreateComponent } from './selectionsproject/selectionsprojectcreate/selectionsprojectcreate.component';
import { SelectionsprojecteditComponent } from './selectionsproject/selectionsprojectedit/selectionsprojectedit.component';
import { SelectionsProjectComponent } from './selectionsproject/selectionsproject.component';
// import { WeeklyReportEditComponent } from './edit/weeklyreportedit.component';
// import { SampleChangesGuard } from '../shared/unsaved-changes-guard';  

export const SelectionsRoutes: Routes = [
    {
        path: '',
        children: [ {
                path: '',
                component: SelectionsComponent,
            
            },
            {
                path: 'project/:id',
                component: SelectionsProjectComponent,
                
            },
            {
                path: 'project/:id/create',
                component: SelectionsprojectcreateComponent,
               
                
            },
            {
                path: 'project/:id/edit/:id2',
                component: SelectionsprojecteditComponent,
                
            }
           
        ]
    }
];
