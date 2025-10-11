import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OficinaPageRoutingModule } from './oficina-routing.module';

import { OficinaPage } from './oficina.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OficinaPageRoutingModule
  ],
  declarations: [OficinaPage]
})
export class OficinaPageModule {}
