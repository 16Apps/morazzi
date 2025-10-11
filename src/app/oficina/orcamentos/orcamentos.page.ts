import { Component, OnInit } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { UteisService } from '../../services/uteis.service';

import { OrcamentoDetalhePage } from '../../orcamento-detalhe/orcamento-detalhe.page';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-orcamentos',
  templateUrl: './orcamentos.page.html',
  styleUrls: ['./orcamentos.page.scss'],
})

export class OrcamentosPage {

  _regOficina: any = {};
  _regOrcamentos: any = []

  constructor(private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController) {

    this.platform.ready().then(async () => {

      this.uteisService.buscarRegistros('oficina_').then((data: any) => {
        this._regOficina = data[0];
        this.onCarregaOrcamentos();
      });

    });

  };

  ngOnInit() {
  };

  async onCarregaOrcamentos() {

    let _url = "/_checkkm?c=orcamentos"
    _url += "&id_oficina=" + this._regOficina._id
    _url += "&pop=id_veiculo"
    _url += "&pop=id_motorista"
    _url += "&pop=id_servico"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {

        this._regOrcamentos = data;

      });

  };

  async onOrcamento(reg: any) {
    const modal = await this.modalController
      .create({
        component: OrcamentoDetalhePage,
        componentProps: {
          returnPage: 'orcamentos',
          _regVeiculosMotorista: reg,
          _regOficina: this._regOficina
        },
      });

    modal.present();

    modal.onDidDismiss().then(async data => {
      this.onCarregaOrcamentos()
    });

  };

  async fecharModal() {
    await this.modalController.dismiss([]);
  };

  onFormataReal(valor: any) {

    valor = parseFloat(valor.toString());
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  };

  formataData(data: any) {
    return moment(data).format("DDMMM")
  };

};
