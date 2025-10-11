import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrcamentoDetalhePage } from './orcamento-detalhe.page';

const routes: Routes = [
  {
    path: '',
    component: OrcamentoDetalhePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrcamentoDetalhePageRoutingModule {}
