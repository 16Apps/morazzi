import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoKmPage } from './info-km.page';

const routes: Routes = [
  {
    path: '',
    component: InfoKmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoKmPageRoutingModule {}
