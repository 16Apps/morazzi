import { Component, NgZone } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { ActivatedRoute } from '@angular/router';

import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import * as moment from 'moment';
moment.locale('pt-br');

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
  _regCliente: any = undefined;

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

      this.uteisService.buscarRegistros('cliente_').then((data: any) => {
        this._regCliente = data[0];
      })

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


    let _id = this.uteisService.autoID()
    let _regLead: any = {
      _id: _id,
      id_session: _id,
      id_parceiro: _regParceiro._id,
      id_cliente: this._regCliente?._id || null,
      registro: 'parceiros_app',
      acao: 'clique_contato',
      registro_conversao: [],
      criado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
      editado_em: moment().format("YYYY-MM-DD HH:mm:ss")
    };

    this.apiService.pathServer('/_bd/leads', _regLead).then((res: any) => {
      let _regVenda = {
        _id: this.uteisService.autoID(),
        id_lead: _id,
        ativo: 1,
  
        id_parceiro: _regParceiro._id,
        id_cliente: this._regCliente?._id || null,
        valor_total: 0,
        doc_venda: '',
        detalhes: '',
        boleto: [],
        status_negocio: 'em_aberto',
        feedback: [],
        criado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
        editado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
      };
  
      this.apiService.pathServer('/_bd/vendas', _regVenda).then((res: any) => {
      })
    });

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

  getMensagemAleatoria(): string {
    const mensagens = [
      'É esse!',
      'Chamar',
      'Contactar',
      'Quero!'
    ];
    return mensagens[Math.floor(Math.random() * mensagens.length)];
  }




}
