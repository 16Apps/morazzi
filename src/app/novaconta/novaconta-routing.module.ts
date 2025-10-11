import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NovacontaPage } from './novaconta.page';

const routes: Routes = [
  {
    path: '',
    component: NovacontaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NovacontaPageRoutingModule {}
