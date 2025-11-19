import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatiaPageRoutingModule } from './chatia-routing.module';

import { ChatiaPage } from './chatia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatiaPageRoutingModule
  ],
  declarations: [ChatiaPage]
})
export class ChatiaPageModule {}
