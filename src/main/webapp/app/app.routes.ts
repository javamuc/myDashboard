import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';

import HomeComponent from './home/home.component';
import { DiaryComponent } from './diary/diary.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'home.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component'),
    outlet: 'navbar',
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
    loadComponent: () => import('./layouts/main/main.component'),
    data: {
      authorities: [Authority.USER],
    },
    canActivate: [UserRouteAccessService],
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
    path: 'entities',
    data: {
      authorities: [Authority.USER],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import(`./entities/entity.routes`),
  },
  {
    path: 'diary',
    component: DiaryComponent,
    canActivate: [UserRouteAccessService],
    data: {
      authorities: [Authority.USER],
    },
  },
  ...errorRoute,
];

export default routes;
