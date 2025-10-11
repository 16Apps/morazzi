import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Platform, ModalController } from '@ionic/angular';

import { UteisService } from '../services/uteis.service';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-info-km',
  templateUrl: './info-km.page.html',
  styleUrls: ['./info-km.page.scss'],
})
export class InfoKmPage implements OnInit {

  _numero: string = '';
  _regVeiculosMotorista: any = {};

  constructor(
    private uteisService: UteisService,

    private platform: Platform,
    private modalController: ModalController,
    private navParams: NavParams) {

    this.platform.ready().then(async () => {
      this._regVeiculosMotorista = this.navParams.get('_regVeiculosMotorista');
    });

  };

  ngOnInit() {

  }

  onAddKm() {

    if (!this._numero) {
      this.uteisService.onToast('Informe o Km 😉', 1300, 'bottom', 'error');
      return;
    }

    if (this._regVeiculosMotorista.id_veiculo.quilometragem.length > 0) {
      if (parseInt(this._numero.replace('.', '')) <= parseInt(this._regVeiculosMotorista.id_veiculo.quilometragem[this._regVeiculosMotorista.id_veiculo.quilometragem.length - 1].km)) {
        this.uteisService.onToast('O KM informado está abaixo do último registro. Corrija para continuar.', 3000, 'bottom', 'error');
        return;
      }
    };

    this._regVeiculosMotorista.id_veiculo.quilometragem.push(({
      _id: this.uteisService.autoID(),
      km: this._numero.replace('.', ''),
      data_registro: moment().format("YYYY-MM-DD HH:mm:ss")
    }));

    this.uteisService.onToast('Km registrado, com sucesso! 😉', 1300, 'bottom', 'normal');
    setTimeout(async () => {

      await this.modalController.dismiss(this._regVeiculosMotorista);

    }, 1500);

  };

  formatarNumero(event: any) {
    let valor = event.detail.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (valor.length > 9) valor = valor.substring(0, 9); // Limita a 9 dígitos (ex: 999.999.999)

    let valorFormatado = valor;

    if (valor.length > 3) {
      valorFormatado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    this._numero = valorFormatado;
  }

  formatarPlaca(event: any) {
    let valor = event.detail.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Converte para maiúsculo e remove não alfanuméricos

    // Limita o valor inicial a no máximo 8 caracteres
    if (valor.length >= 8) {
      valor = valor.substring(0, 8);
    }

    let valorFormatado = valor;

    if (valor.length > 3) {
      valorFormatado = valor.slice(0, 3) + '-' + valor.slice(3);
    }

    this._numero = valorFormatado;
  }


  formataData(date: any) {
    return moment(date).format("DDMMM HH:mm")
  }

  formataDataSemana(date: any) {
    return moment(date).format("DDMMM DDDD")
  }


  async fecharModal() {
    await this.modalController.dismiss();
  }

}
