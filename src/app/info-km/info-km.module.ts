import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoKmPageRoutingModule } from './info-km-routing.module';

import { InfoKmPage } from './info-km.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoKmPageRoutingModule
  ],
  declarations: [InfoKmPage]
})
export class InfoKmPageModule {}
