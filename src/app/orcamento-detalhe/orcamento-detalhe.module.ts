import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrcamentoDetalhePageRoutingModule } from './orcamento-detalhe-routing.module';

import { OrcamentoDetalhePage } from './orcamento-detalhe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrcamentoDetalhePageRoutingModule
  ],
  declarations: [OrcamentoDetalhePage]
})
export class OrcamentoDetalhePageModule {}
