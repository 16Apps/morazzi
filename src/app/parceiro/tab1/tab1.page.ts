import { Component, NgZone } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { UteisService } from '../../services/uteis.service';
import { Router } from '@angular/router';

import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page {

  _regParceiro: any = undefined;
  showValues: boolean = true;

  _regVendas: any = [];
  ultimaVenda = '0 dias';
  acumuladoGeral = 0;
  acumuladoMes = 0;

  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  };
  readonly cpfMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/],
  };
  readonly creditCardMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  };
  readonly creditCardCVCMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/],
  };
  readonly cepMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  };
  readonly chaveMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, /\d/],
  };

  readonly placaMask: MaskitoOptions = {
    mask: [
      /[A-Z0-9]/, /[A-Z0-9]/, /[A-Z0-9]/,  // Três primeiros caracteres
      '-',                                  // Hífen fixo
      /[A-Z0-9]/, /[A-Z0-9]/, /[A-Z0-9]/, /[A-Z0-9]/ // Quatro últimos caracteres
    ],
  };

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as unknown as HTMLIonInputElement).getInputElement();


  constructor(
    private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    public zone: NgZone,
    private router: Router) {

    this.platform.ready().then(async () => {

      await this.onCarregaParceiro()
      await this.onCarregaVendas();

      setTimeout(async () => {
        await this.onSyncServer();
      }, 2000);


    });

  }

  ngOnInit() {
  }

  async onCarregaParceiro() {
    this.uteisService.buscarRegistros('parceiro_').then((data: any) => {
      this._regParceiro = data[0];

      let _nAbr = this._regParceiro.razao_social.split(' ')
      this._regParceiro['_razao_social'] = _nAbr[0] + ' ' + _nAbr[1]

      this._regParceiro['_logo'] = 'https://media.lordicon.com/icons/wired/lineal/44-avatar-user-in-circle.svg'
      if (this._regParceiro.logo != '') {
        this._regParceiro._logo = this.apiService.baseUrl + '/image/' + this._regParceiro.logo;


      };
    });
  }

  async onCarregaVendas() {

    this.uteisService.buscarRegistros('vendas_').then((data: any) => {
      if (data.length > 0) {

        this._regVendas = data
        let totalGeral = 0;
        let totalMes = 0;

        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();

        for (let venda of this._regVendas) {

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

  async onSyncServer() {

    //atualiza dados parceiro
    let _url = '/_bd?c=parceiros'
    _url += "&_id=" + this._regParceiro._id

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {
        await this.uteisService.salvarBase('parceiro_', [this._regParceiro])
        this.onCarregaParceiro()
      });

    //atualiza dados venda
    _url = '/_bd?c=vendas'
    _url += "&pop=id_cliente"
    _url += "&id_parceiro=" + this._regParceiro._id
    _url += "&_sort=editado_em"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {
        await this.uteisService.salvarBase('vendas_', data)
        this.onCarregaVendas()
      });

    //atualiza dados venda
    _url = '/_bd?c=leads'
    _url += "&pop=id_cliente"
    _url += "&id_parceiro=" + this._regParceiro._id
    _url += "&_sort=editado_em"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {

        await this.uteisService.salvarBase('leads_', data)
      });

  };

  toggleValues() {
    this.showValues = !this.showValues;
  }

  onFormataData(_date: any) {

    return moment(_date).format("DDMMMYY")

  }

  async onSair() {
    await this.uteisService.limparBase('cliente_')
    this.navCtrl.navigateRoot('');
  };

}
