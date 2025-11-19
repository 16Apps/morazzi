import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavController, ModalController, IonModal } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  showValues: boolean = true;

  _regVendas: any = []
  ultimaVenda = '0';
  acumuladoGeral = 0;
  acumuladoMes = 0;

  constructor(private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    public zone: NgZone,
    private route: ActivatedRoute) {

    this.platform.ready().then(async () => {
      this.onCarregaVendas();
    })
  };

  onCarregaVendas() {

    this.uteisService.buscarRegistros('vendas_').then((data: any) => {
      if (data.length > 0) {

        this._regVendas = data
        let totalGeral = 0;
        let totalMes = 0;

        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();

        for (let venda of this._regVendas) {

          let _nRazao = venda.id_parceiro.razao_social.split(' ')
          venda.id_parceiro.razao_social_ = _nRazao[0]
          const valor = venda.valor_total;

          // Soma geral
          totalGeral += valor;

          // Soma apenas vendas do mês atual
          const dt = new Date(venda.editado_em);
          if (dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual) {
            totalMes += valor;
          }
        }

        // Agora formata para BR
        this.acumuladoGeral = totalGeral;
        this.acumuladoMes = totalMes;
      }
    })



  }

    onFormataData(_date: any) {
  
      return moment(_date).format("DDMMMYY HH[h]mm")
  
    }
  
}
