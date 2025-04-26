import { Routes } from '@angular/router';

import { UpdatePasswordComponent } from './updatepassword.component';

export const UpdatePasswordRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: UpdatePasswordComponent
    }]
}
];
