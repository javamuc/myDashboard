import { Routes } from '@angular/router';
import { BoardComponent } from 'app/shared/board/board.component';
import { BoardSettingsComponent } from './settings/board-settings.component';

export const BOARD_ROUTE: Routes = [
  {
    path: '',
    component: BoardComponent,
  },
  {
    path: 'settings',
    component: BoardSettingsComponent,
    data: {
      pageTitle: 'Board Settings',
    },
  },
];
