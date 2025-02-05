import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component'),
    title: 'home.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component'),
    outlet: 'navbar',
  },
  {
    path: 'board',
    loadChildren: () => import('./board/board.route').then(r => r.BOARD_ROUTE),
    canActivate: [UserRouteAccessService],
    data: {
      authorities: [Authority.USER],
    },
  },
  {
    path: 'habit',
    loadChildren: () => import('./habit/habit.routes').then(r => r.HABIT_ROUTE),
    canActivate: [UserRouteAccessService],
    data: {
      authorities: [Authority.USER],
    },
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
    title: 'login.title',
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`),
  },
  ...errorRoute,
];

export default routes;
