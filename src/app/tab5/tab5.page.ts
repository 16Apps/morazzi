import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavController, ModalController, IonModal } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page {

  @ViewChild('modalCash') modalCash!: IonModal;


  threadId: string = ''
  _historico: any = [{
    role: 'assistant',
    content: '👋 Olá! Sou a assistente Morazzi. Em que posso te ajudar hoje?'
  }]
  parceiros: any = []
  _modalCash: boolean = false;

  mensagem: string = '';
  _iaDigitando = false;

  _regCliente: any = undefined;

  constructor(
    private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    public zone: NgZone,
    private route: ActivatedRoute) {

    this.platform.ready().then(async () => {

      this.threadId = this.uteisService.autoID();

      this.uteisService.buscarRegistros('cliente_').then((data: any) => {
        this._regCliente = data[0];
      })

    })
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.mensagem = params['busca']
      if (this.mensagem) {
        this.onEnvioChat()
      }
    })

  }


  onEnvioChat() {

    if (!this.mensagem) {
      return;
    }

    this._historico.push({
      role: 'user',
      content: this.mensagem
    })

    let _body = {
      "threadId": this.threadId,
      "mensagem": this.mensagem
    }
    this.mensagem = '';

    // ativa indicador de digitação
    this._iaDigitando = true;

    this.apiService.postServer('/api/chat', _body).then((res: any) => {

      res = JSON.parse(res)
      this._iaDigitando = false;


      let _frase = res.respostas.principal.split("|")

      this._historico.push({
        role: 'assistant',
        content: _frase[0],
        parceiro: false
      })



      // for (let i = 0; i < res.parceiros.length; i++) {
      //   res.parceiros[i].logo = this.apiService.baseUrl + '/image/' + res.parceiros[i].logo
      //   this.parceiros.push(res.parceiros[i])
      // }


      if (_frase.length > 1) {
        setTimeout(() => {
          this._iaDigitando = true;
          for (let i = 0; i < _frase.length; i++) {

            if (i > 0) {
              setTimeout(() => {
                this._iaDigitando = false;
                this._historico.push({
                  role: 'assistant',
                  content: _frase[i],
                  parceiro: false
                })
              }, 2000 * 1);
            }
          }

        }, 2000);
      }

      if (!this._modalCash) {
        this._modalCash = true
        setTimeout(() => {
          this.modalCash.present();
          setTimeout(() => {
            this.modalCash.dismiss()
          }, 10000);
        }, 3000);
      }

      setTimeout(() => {
        this._historico.push({
          role: 'assistant',
          content: _frase[0],
          parceiro: true,
          nome_fantasia: res.parceiros[0].nome_fantasia,
          razao_social: res.parceiros[0].razao_social,
          celular: res.parceiros[0].celular,
          telefone: res.parceiros[0].telefone,
          site: res.parceiros[0].site,
          instagram: res.parceiros[0].instagram,
          logo: this.apiService.baseUrl + '/image/' + res.parceiros[0].logo,
          id_parceiro: res.parceiros[0]._id
        })

        this.onRegistroLeadBot(res.parceiros[0]._id, 'indicacao_bot')
      }, 5000);


    })

  }

  onRegistroLeadBot(id_parceiro: string, acao: string) {


    let _regLead: any = {
      _id: this.uteisService.autoID(),
      id_parceiro: id_parceiro,
      id_cliente: this._regCliente._id,
      registro: 'bot',
      acao: acao,
      criado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
      editado_em: moment().format("YYYY-MM-DD HH:mm:ss")
    };

    this.apiService.pathServer('/_bd/leads', _regLead).then((res: any) => {

    })

  }

  formatMessage(text: string) {
    if (!text) return '';
    // Substitui **texto** por <strong>texto</strong>
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

}
