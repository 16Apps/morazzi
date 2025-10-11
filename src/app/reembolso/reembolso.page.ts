import { Component, OnInit } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reembolso',
  templateUrl: './reembolso.page.html',
  styleUrls: ['./reembolso.page.scss'],
})
export class ReembolsoPage implements OnInit {

  constructor(
    private platform: Platform,
    private modalController: ModalController) {

    this.platform.ready().then(async () => {

    });

  };

  ngOnInit() {
  }

  async fecharModal() {
    await this.modalController.dismiss();
  }

}
