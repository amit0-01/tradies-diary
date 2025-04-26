import { Routes } from '@angular/router';

import { RFIPROJECTComponent } from './rfiproject/rfiproject.component';
import { RFICREATEPROJECTComponent } from './rfiproject/rficreateproject/rficreateproject.component';
import { RFIEDITCOMPONENTComponent } from './rfiproject/rfieditcomponent/rfieditcomponent.component';
import { RFIComponent } from './rfi.component';



// import { SampleChangesGuard } from '../shared/unsaved-changes-guard';  

export const RFIRoutes: Routes = [
    {
        path: '',
        children: [ 
            {
                path: '',
                component: RFIComponent,
                // canDeactivate: [SampleChangesGuard]
            },
            {
                path: 'project/:id',
                component: RFIPROJECTComponent
                // canDeactivate: [SampleChangesGuard]
            },
            {
                path: 'project/:id/create',
                component: RFICREATEPROJECTComponent
                // canDeactivate: [SampleChangesGuard]
            },
            {
                path: 'project/:id/edit/:id2',
                component: RFIEDITCOMPONENTComponent
                // canDeactivate: [SampleChangesGuard]
            },
           
        ]
    }
];
