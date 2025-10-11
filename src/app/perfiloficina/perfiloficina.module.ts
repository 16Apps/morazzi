import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfiloficinaPageRoutingModule } from './perfiloficina-routing.module';

import { PerfiloficinaPage } from './perfiloficina.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfiloficinaPageRoutingModule
  ],
  declarations: [PerfiloficinaPage]
})
export class PerfiloficinaPageModule {}
