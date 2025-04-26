import { Routes } from '@angular/router';

import { TradesComponent } from './trades.component';
import { TradesCreateComponent } from './tradescreate/tradescreate.component';
import { TradesEditComponent } from './tradesedit/tradesedit.component';

export const TradesRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: TradesComponent
            },
            {
                path: 'create',
                component: TradesCreateComponent
            },
            {
                path: 'edit/:id',
                component: TradesEditComponent
            },
        ]
    }
];
