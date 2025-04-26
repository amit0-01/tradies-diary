import { Routes } from '@angular/router';

import { TradeCategoriesComponent } from './tradecategories.component';

export const TradeCategoriesRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: TradeCategoriesComponent
            }
        ]
    }
];
