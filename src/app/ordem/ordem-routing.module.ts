import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdemPage } from './ordem.page';

const routes: Routes = [
  {
    path: '',
    component: OrdemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdemPageRoutingModule {}
