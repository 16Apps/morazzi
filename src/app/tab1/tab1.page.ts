import { Component, NgZone } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { Router } from '@angular/router';

import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {


  @ViewChild('modalIA') modalIA!: IonModal;

  _regCliente: any = undefined;
  _txtBusca: string = "";
  _regParceiros: any = [];
  openSection: any = '';

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

      this.uteisService.buscarRegistros('cliente_').then((data: any) => {
        this._regCliente = data[0];
        this._regCliente['_foto'] = 'https://media.lordicon.com/icons/wired/lineal/44-avatar-user-in-circle.svg'
        if (this._regCliente.foto != '') {
          this._regCliente._foto = this.apiService.baseUrl + '/image/' + this._regCliente.foto
        };
        //alert(JSON.stringify(data))

        this.onAtualizaCliente()
      });


      this.onCarregaParceiros();

    });
  };

  ngOnInit() {

  }

  async onAtualizaCliente() {

    let _url = '/_bd?c=clientes'
    _url += "&_id=" + this._regCliente._id

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {
        this._regCliente = data[0];
        this._regCliente['_foto'] = 'https://media.lordicon.com/icons/wired/lineal/44-avatar-user-in-circle.svg'
        if (this._regCliente.foto != '') {
          this._regCliente._foto = this.apiService.baseUrl + '/image/' + this._regCliente.foto
        };

      });

    //atualiza dados venda
    _url = '/_bd?c=vendas'
    _url += "&pop=id_parceiro"
    _url += "&id_cliente=" + this._regCliente._id
    _url += "&_sort=editado_em"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {
        await this.uteisService.salvarBase('vendas_', data)
      });

  };

  async onCarregaParceiros() {

    let _url = '/_bd?c=parceiros'
    _url += "&sort=razao_social"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {
        this._regParceiros = data;

        for (let i = 0; i < this._regParceiros.length; i++) {
          this._regParceiros[i]['_logo'] = 'https://cdn-icons-png.flaticon.com/512/7553/7553838.png'
          if (this._regParceiros[i].logo != '') {
            this._regParceiros[i]._logo = this.apiService.baseUrl + '/image/' + this._regParceiros[i].logo
          };

        };

      });

  };

  async onChatIA() {
    await this.router.navigate(['/tabs/tab5', { busca: this._txtBusca }]);
    this._txtBusca = '';
  }

  async onSair() {

    await this.uteisService.limparBase('cliente_')
    this.navCtrl.navigateRoot('');

  }

  formataData(data: any) {
    return moment(data).format("DDMMM")
  }

  formataDataHoras(data: any) {
    return moment(data).format("DDMMM HH:mm")
  }

  formataDataBR(data: any) {
    return moment(data).format("DD/MM/YYYY")
  }

  onFormataReal(valor: any) {

    valor = parseFloat(valor.toString());
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  };

  toggleSection(section: string) {
    this.openSection = this.openSection === section ? null : section;
  }

}
