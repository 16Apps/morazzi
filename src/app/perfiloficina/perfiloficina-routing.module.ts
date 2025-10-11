import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfiloficinaPage } from './perfiloficina.page';

const routes: Routes = [
  {
    path: '',
    component: PerfiloficinaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfiloficinaPageRoutingModule {}
