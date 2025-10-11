import { Component, OnInit } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-oficinas',
  templateUrl: './oficinas.page.html',
  styleUrls: ['./oficinas.page.scss'],
})
export class OficinasPage implements OnInit {

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
