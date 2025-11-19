import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatiaPage } from './chatia.page';

const routes: Routes = [
  {
    path: '',
    component: ChatiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatiaPageRoutingModule {}
