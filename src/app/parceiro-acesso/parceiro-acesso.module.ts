import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaskitoModule } from '@maskito/angular';

import { IonicModule } from '@ionic/angular';

import { ParceiroAcessoPageRoutingModule } from './parceiro-acesso-routing.module';

import { ParceiroAcessoPage } from './parceiro-acesso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParceiroAcessoPageRoutingModule,
    MaskitoModule
  ],
  declarations: [ParceiroAcessoPage]
})
export class ParceiroAcessoPageModule {}
