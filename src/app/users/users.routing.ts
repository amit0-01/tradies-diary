import { Routes } from '@angular/router';

import { UsersComponent } from './users.component';

// import { ModifyUserComponent } from './modifyuser/modifyuser.component';

export const UsersRoutes: Routes = [
{

      path: '',
      children: [ {
        path: '',
        component: UsersComponent
      // }, {
      //   path: 'edit/:id',
      //   component: ModifyUserComponent
      }
  ]
}
];