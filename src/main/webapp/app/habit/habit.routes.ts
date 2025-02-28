import { Routes } from '@angular/router';
import { HabitManagementComponent } from './management/habit-management.component';

export const HABIT_ROUTE: Routes = [
  {
    path: '',
    component: HabitManagementComponent,
  },
  {
    path: 'settings',
    component: HabitManagementComponent,
    data: {
      pageTitle: 'Habit Settings',
    },
  },
];
