import { Component, NgZone } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { ActivatedRoute } from '@angular/router';

import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  @ViewChild('modalFiltro') modalFiltro!: IonModal;
  @ViewChild('modalInteracao') modalInteracao!: IonModal;



  _regAnunciosDestaques: any = [];
  _regAnuncios: any = [];

  _opBusca = "local"
  _listCidades: any = [];
  _listAtividades: any = [];
  _listSustentabilidades: any = [];

  _regParceiros: any = [];
  _regParceirosBase: any = [];
  _regAtuacoes: any = [];
  _regSegmentos: any = [];
  _regCidades: any = [];

  _txtBusca: string = "";

  _registroInteracao: string = '';
  _registroInteracaoParceiro: string = '';

  constructor(
    private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    public zone: NgZone,
    private route: ActivatedRoute) {

    this.platform.ready().then(async () => {

      this.route.queryParams.subscribe(params => {
        if (params['valor']) {
          this._txtBusca = params['valor'];
        };
      });

      // this.onCarregaAtividades();
      // this.onCarregaSustentabilidade();
      // this.onCarregaAnuncios();
      // this.onCarregaAnunciosTodos();
      this.onCarregaParceiros();
      this.onCarregaAtuacoes()
      this.onCarregaSegmentos()

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



          let iFind = this._regCidades.findIndex((item: any) => item.cidade == this._regParceiros[i].endereco.cidade)
          if (iFind == -1) {
            this._regCidades.push(
              {
                cidade: this._regParceiros[i].endereco.cidade,
                estado: this._regParceiros[i].endereco.estado,
                selecionado: false
              }
            )
          }


        };

        this._regParceirosBase = this._regParceiros

      });

  };

  async onCarregaAtuacoes() {

    this._regAtuacoes.push(
      {
        _id: 'projeto',
        atuacao: 'Projeto',
        selecionado: false
      },
      {
        _id: 'acabamento',
        atuacao: 'Acabamento',
        selecionado: false
      },
      {
        _id: 'decoracao',
        atuacao: 'Decoração',
        selecionado: false
      }
    );
  };

  async onCarregaSegmentos() {

    let _url = '/_bd?c=segmentos'
    _url += "&sort=segmento"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {


        this._regSegmentos = data
        for (let i = 0; i < this._regSegmentos.length; i++) {
          this._regSegmentos[i]['selecionado'] = false
        }

      });

  };

  onFiltro() {
    this.modalFiltro.present()
  }


  onFiltroAtuacao(atuacao: string) {
    this.modalFiltro.dismiss()
    this.uteisService.onLoading('Filtrando...', 1100)

    setTimeout(() => {
      this._regParceiros = this._regParceirosBase.filter((item: any) => item.atuacao == atuacao)
    }, 1200);

  };

  onRegistroInteracao(_regParceiro: any) {
    this.modalInteracao.present()
    this._registroInteracaoParceiro = _regParceiro.apelido;
    this._registroInteracao = 'registrando'

    setTimeout(() => {
      this._registroInteracao = 'registrado';

      setTimeout(() => {
        this.modalInteracao.dismiss()
        this._registroInteracao = ''
      }, 5500);

    }, 3000);
  }





  trataAtuacao(atuacao: string) {
    if (atuacao == 'projeto') {
      return "Projeto"
    } else if (atuacao == 'acabamento') {
      return "Acabamento"
    } else if (atuacao == 'decoracao') {
      return "Decoração"
    } else {
      return atuacao
    }
  };




}
