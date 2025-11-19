import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { UteisService } from './services/uteis.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private uteisService: UteisService,
    private navCtrl: NavController) {


    this.platform.ready().then(async () => {

      this.uteisService.buscarRegistros('cliente_').then((res: any) => {
        if (res.length > 0) {
          this.navCtrl.navigateRoot('tabs/tab1');

        } else {

          this.uteisService.buscarRegistros('parceiro_').then((res: any) => {
            if (res.length > 0) {
              this.navCtrl.navigateRoot('/parceiro/tabs/tab1');
            }
          })
        }
        
      })
    });

  };
};
