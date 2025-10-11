import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'rodizio',
    loadChildren: () => import('./rodizio/rodizio.module').then( m => m.RodizioPageModule)
  },
  {
    path: 'servico',
    loadChildren: () => import('./servico/servico.module').then( m => m.ServicoPageModule)
  },
  {
    path: 'ordem',
    loadChildren: () => import('./ordem/ordem.module').then( m => m.OrdemPageModule)
  },
  {
    path: 'info-km',
    loadChildren: () => import('./info-km/info-km.module').then( m => m.InfoKmPageModule)
  },
  {
    path: 'oficinas',
    loadChildren: () => import('./oficinas/oficinas.module').then( m => m.OficinasPageModule)
  },
  {
    path: 'agendar',
    loadChildren: () => import('./agendar/agendar.module').then( m => m.AgendarPageModule)
  },
  {
    path: 'reembolso',
    loadChildren: () => import('./reembolso/reembolso.module').then( m => m.ReembolsoPageModule)
  },
  {
    path: 'certificados',
    loadChildren: () => import('./certificados/certificados.module').then( m => m.CertificadosPageModule)
  },
  {
    path: 'historico',
    loadChildren: () => import('./historico/historico.module').then( m => m.HistoricoPageModule)
  },
  {
    path: 'novaconta',
    loadChildren: () => import('./novaconta/novaconta.module').then( m => m.NovacontaPageModule)
  },
  {
    path: 'oficina',
    loadChildren: () => import('./oficina/oficina.module').then( m => m.OficinaPageModule)
  },
  {
    path: 'perfiloficina',
    loadChildren: () => import('./perfiloficina/perfiloficina.module').then( m => m.PerfiloficinaPageModule)
  },
  {
    path: 'orcamento-detalhe',
    loadChildren: () => import('./orcamento-detalhe/orcamento-detalhe.module').then( m => m.OrcamentoDetalhePageModule)
  },
  {
    path: 'tab4',
    loadChildren: () => import('./tab4/tab4.module').then( m => m.Tab4PageModule)
  },
  {
    path: 'anuncio',
    loadChildren: () => import('./anuncio/anuncio.module').then( m => m.AnuncioPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
