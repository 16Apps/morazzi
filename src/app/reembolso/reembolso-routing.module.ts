import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReembolsoPage } from './reembolso.page';

const routes: Routes = [
  {
    path: '',
    component: ReembolsoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReembolsoPageRoutingModule {}
