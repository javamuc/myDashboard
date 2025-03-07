import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import accountRoutes from './account.route';

@NgModule({
  imports: [RouterModule.forChild(accountRoutes)],
})
export class AccountModule {}
