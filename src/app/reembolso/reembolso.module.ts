import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReembolsoPageRoutingModule } from './reembolso-routing.module';

import { ReembolsoPage } from './reembolso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReembolsoPageRoutingModule
  ],
  declarations: [ReembolsoPage]
})
export class ReembolsoPageModule {}
