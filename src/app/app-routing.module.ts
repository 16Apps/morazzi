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
    loadChildren: () => import('./rodizio/rodizio.module').then(m => m.RodizioPageModule)
  },
  {
    path: 'servico',
    loadChildren: () => import('./servico/servico.module').then(m => m.ServicoPageModule)
  },
  {
    path: 'ordem',
    loadChildren: () => import('./ordem/ordem.module').then(m => m.OrdemPageModule)
  },
  {
    path: 'info-km',
    loadChildren: () => import('./info-km/info-km.module').then(m => m.InfoKmPageModule)
  },
  {
    path: 'oficinas',
    loadChildren: () => import('./oficinas/oficinas.module').then(m => m.OficinasPageModule)
  },
  {
    path: 'agendar',
    loadChildren: () => import('./agendar/agendar.module').then(m => m.AgendarPageModule)
  },
  {
    path: 'reembolso',
    loadChildren: () => import('./reembolso/reembolso.module').then(m => m.ReembolsoPageModule)
  },
  {
    path: 'certificados',
    loadChildren: () => import('./certificados/certificados.module').then(m => m.CertificadosPageModule)
  },
  {
    path: 'historico',
    loadChildren: () => import('./historico/historico.module').then(m => m.HistoricoPageModule)
  },
  {
    path: 'novaconta',
    loadChildren: () => import('./novaconta/novaconta.module').then(m => m.NovacontaPageModule)
  },
  {
    path: 'oficina',
    loadChildren: () => import('./oficina/oficina.module').then(m => m.OficinaPageModule)
  },
  {
    path: 'perfiloficina',
    loadChildren: () => import('./perfiloficina/perfiloficina.module').then(m => m.PerfiloficinaPageModule)
  },
  {
    path: 'orcamento-detalhe',
    loadChildren: () => import('./orcamento-detalhe/orcamento-detalhe.module').then(m => m.OrcamentoDetalhePageModule)
  },
  {
    path: 'tab4',
    loadChildren: () => import('./tab4/tab4.module').then(m => m.Tab4PageModule)
  },
  {
    path: 'anuncio',
    loadChildren: () => import('./anuncio/anuncio.module').then(m => m.AnuncioPageModule)
  },
  {
    path: 'chatia',
    loadChildren: () => import('./chatia/chatia.module').then(m => m.ChatiaPageModule)
  },
  {
    path: 'tab5',
    loadChildren: () => import('./tab5/tab5.module').then(m => m.Tab5PageModule)
  },
  {
    path: 'parceiro-acesso',
    loadChildren: () => import('./parceiro-acesso/parceiro-acesso.module').then(m => m.ParceiroAcessoPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./parceiro/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'tab1',
    loadChildren: () => import('./parceiro/tab1/tab1.module').then(m => m.Tab1PageModule)
  },
  {
    path: 'tab2',
    loadChildren: () => import('./parceiro/tab2/tab2.module').then(m => m.Tab2PageModule)
  },
  {
    path: 'tab3',
    loadChildren: () => import('./parceiro/tab3/tab3.module').then(m => m.Tab3PageModule)
  },
  {
    path: 'tab4',
    loadChildren: () => import('./parceiro/tab4/tab4.module').then(m => m.Tab4PageModule)
  },
  {
    path: 'parceiro',
    loadChildren: () =>
      import('./parceiro/parceiro.module').then(m => m.ParceiroModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
