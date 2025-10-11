import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaskitoModule } from '@maskito/angular';
import { IonicModule } from '@ionic/angular';

import { NovacontaPageRoutingModule } from './novaconta-routing.module';

import { NovacontaPage } from './novaconta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NovacontaPageRoutingModule,
    MaskitoModule
  ],
  declarations: [NovacontaPage]
})
export class NovacontaPageModule {}
