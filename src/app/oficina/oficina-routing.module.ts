import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OficinaPage } from './oficina.page';

const routes: Routes = [
  {
    path: '',
    component: OficinaPage,
    children: [
      {
        path: 'servicos',
        loadChildren: () => import('./servicos/servicos.module').then(m => m.ServicosPageModule)
      },
      {
        path: 'orcamentos',
        loadChildren: () => import('./orcamentos/orcamentos.module').then(m => m.OrcamentosPageModule)
      },
      {
        path: 'certificados',
        loadChildren: () => import('./certificados/certificados.module').then(m => m.CertificadosPageModule)
      },
      {
        path: '',
        redirectTo: 'servicos',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OficinaPageRoutingModule { }
