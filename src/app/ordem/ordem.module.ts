import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdemPageRoutingModule } from './ordem-routing.module';

import { OrdemPage } from './ordem.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdemPageRoutingModule
  ],
  declarations: [OrdemPage]
})
export class OrdemPageModule {}
