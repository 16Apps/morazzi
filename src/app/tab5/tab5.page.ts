import { Component, ViewChild, NgZone, AfterViewChecked, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, ModalController, IonModal, IonContent } from '@ionic/angular';
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
export class Tab5Page implements AfterViewChecked, AfterViewInit {

  @ViewChild('modalCash') modalCash!: IonModal;
  @ViewChild('modalContact') modalContact!: IonModal;
  @ViewChild('contentArea') contentArea!: IonContent;

  _parceiroSelecionado: any = null;


  threadId: string = ''
  _historico: any = [{
    role: 'assistant',
    content: '👋 Olá! Sou a assistente Morazzi. Em que posso te ajudar hoje?',
    timestamp: moment().toDate()
  }]
  parceiros: any = []
  _modalCash: boolean = false;
  _ultimaMensagemCliente: number = -1; // Índice da última mensagem do cliente antes da indicação

  mensagem: string = '';
  _iaDigitando = false;

  _regCliente: any = undefined;

  private shouldScrollToBottom = false;

  constructor(
    private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    public zone: NgZone,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef) {

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

  ngAfterViewInit() {
    // Scroll inicial para o final
    setTimeout(() => {
      this.scrollToBottom();
    }, 500);
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  scrollToBottom() {
    if (this.contentArea) {
      setTimeout(() => {
        this.contentArea.scrollToBottom(300);
      }, 100);
    }
  }


  onEnvioChat() {

    if (!this.mensagem) {
      return;
    }

    this._historico.push({
      role: 'user',
      content: this.mensagem,
      timestamp: moment().toDate()
    })
    this._ultimaMensagemCliente = this._historico.length - 1;
    this.shouldScrollToBottom = true;

    let _body = {
      "threadId": this.threadId,
      "mensagem": this.mensagem
    }
    this.mensagem = '';

    // ativa indicador de digitação
    this._iaDigitando = true;
    this.shouldScrollToBottom = true;

    this.apiService.postServer('/api/chat', _body).then((res: any) => {

      console.log(res)
      res = JSON.parse(res)
      this._iaDigitando = false;
      this.shouldScrollToBottom = true;


      let _frase = res.respostas.principal.split("|")

      this._historico.push({
        role: 'assistant',
        content: _frase[0],
        parceiro: false,
        timestamp: moment().toDate()
      })
      this.shouldScrollToBottom = true;



      // for (let i = 0; i < res.parceiros.length; i++) {
      //   res.parceiros[i].logo = this.apiService.baseUrl + '/image/' + res.parceiros[i].logo
      //   this.parceiros.push(res.parceiros[i])
      // }


      if (_frase.length > 1) {
        setTimeout(() => {
          this._iaDigitando = true;
          this.shouldScrollToBottom = true;
          for (let i = 0; i < _frase.length; i++) {

            if (i > 0) {
              setTimeout(() => {
                this._iaDigitando = false;
                this._historico.push({
                  role: 'assistant',
                  content: _frase[i],
                  parceiro: false,
                  timestamp: moment().toDate()
                })
                this.shouldScrollToBottom = true;
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
          email: res.parceiros[0].email,
          site: res.parceiros[0].site,
          instagram: res.parceiros[0].instagram,
          logo: this.apiService.baseUrl + '/image/' + res.parceiros[0].logo,
          id_parceiro: res.parceiros[0]._id,
          cidade: res.parceiros[0].endereco.cidade,
          estado: res.parceiros[0].endereco.estado,
          timestamp: moment().toDate()
        })
        this.shouldScrollToBottom = true;

        this.onRegistroLeadBot(res.parceiros[0]._id, 'indicacao_bot')

        // Adiciona mensagem perguntando se deseja contactar o parceiro
        setTimeout(() => {
          this._historico.push({
            role: 'assistant',
            content: 'Deseja entrar em contato com este parceiro?',
            contato: true,
            id_parceiro: res.parceiros[0]._id,
            celular: res.parceiros[0].celular,
            telefone: res.parceiros[0].telefone,
            email: res.parceiros[0].email,
            timestamp: moment().toDate()
          })
          this.shouldScrollToBottom = true;
        }, 2000);
      }, 5000);


    })

  }

  onRegistroLeadBot(id_parceiro: string, acao: string) {

    // Coleta as mensagens da conversa desde a solicitação do cliente até a indicação
    let registroConversao: any[] = [];

    // Encontra o índice onde o parceiro foi indicado (primeira ocorrência)
    let indiceParceiro = this._historico.findIndex((item: any) =>
      item.id_parceiro === id_parceiro && item.parceiro === true
    );

    // Encontra o índice da primeira mensagem do cliente antes da indicação
    // (ignora a mensagem inicial de boas-vindas)
    let indiceInicio = this._historico.findIndex((item: any) => item.role === 'user');

    // Se não encontrou parceiro ou cliente, usa toda a conversa
    let indiceFim = indiceParceiro >= 0 ? indiceParceiro : this._historico.length - 1;
    let inicio = indiceInicio >= 0 ? indiceInicio : 0;

    // Percorre as mensagens desde a primeira do cliente até a indicação do parceiro
    for (let i = inicio; i <= indiceFim && i < this._historico.length; i++) {
      let item = this._historico[i];

      // Inclui mensagens do usuário
      if (item.role === 'user') {
        registroConversao.push({
          _id: this.uteisService.autoID(),
          remetente: 'cliente',
          mensagem: item.content,
          registro: item.timestamp || moment().toDate()
        });
      }

      // Inclui mensagens da assistente (texto puro, sem parceiro ou contato)
      if (item.role === 'assistant' && !item.parceiro && !item.contato && item.content) {
        registroConversao.push({
          _id: this.uteisService.autoID(),
          remetente: 'assistant',
          mensagem: item.content,
          registro: item.timestamp || moment().toDate()
        });
      }

      // Se for o item do parceiro indicado, adiciona uma mensagem especial
      if (i === indiceParceiro && item.parceiro) {
        registroConversao.push({
          _id: this.uteisService.autoID(),
          remetente: 'assistant',
          mensagem: `Parceiro indicado: ${item.nome_fantasia || item.razao_social}`,
          registro: item.timestamp || moment().toDate()
        });
      }
    }

    let _regLead: any = {
      _id: this.uteisService.autoID(),
      id_session: this.threadId,
      id_parceiro: id_parceiro,
      id_cliente: this._regCliente?._id || null,
      registro: 'bot',
      acao: acao,
      registro_conversao: registroConversao,
      criado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
      editado_em: moment().format("YYYY-MM-DD HH:mm:ss")
    };

    this.apiService.pathServer('/_bd/leads', _regLead).then((res: any) => {
      if (acao == 'clique_contato') {
        this.onRegistraVenda(_regLead._id, id_parceiro)
      };
    });

  };

  onRegistraVenda(id_lead: string, id_parceiro: string) {

    let _regVenda = {
      _id: this.uteisService.autoID(),
      id_lead: id_lead,
      ativo: 1,

      id_parceiro: id_parceiro,
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
  };

  formatMessage(text: string) {
    if (!text) return '';
    // Substitui **texto** por <strong>texto</strong>
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  onContactarParceiro(item: any) {
    // Salva os dados do parceiro para o modal
    this._parceiroSelecionado = item;

    // Registra a ação
    this.onRegistroLeadBot(item.id_parceiro, 'clique_contato');

    // Abre o modal
    this.modalContact.present();

    setTimeout(() => {
      this.modalContact.dismiss();
    }, 6000);
  }

  onAbrirWhatsApp() {
    if (this._parceiroSelecionado) {
      const telefone = this._parceiroSelecionado.celular || this._parceiroSelecionado.telefone;
      if (telefone) {
        const numeroLimpo = telefone.replace(/\D/g, '');
        const url = `https://wa.me/${numeroLimpo}`;
        window.open(url, '_blank');
        this.onRegistroLeadBot(this._parceiroSelecionado.id_parceiro, 'clique_whats_modal');
        this.modalContact.dismiss();
      }
    }
  }

  onAbrirEmail() {
    if (this._parceiroSelecionado && this._parceiroSelecionado.email) {
      const email = this._parceiroSelecionado.email;
      const url = `mailto:${email}`;
      window.open(url, '_blank');
      this.onRegistroLeadBot(this._parceiroSelecionado.id_parceiro, 'clique_email_modal');
      this.modalContact.dismiss();
    }
  }

}
