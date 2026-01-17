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

  @ViewChild('modalDetalheVenda') modalDetalheVenda!: IonModal;

  showValues: boolean = true;
  _regCliente: any = undefined;

  _regVendas: any = []
  _regVendasBase: any = []
  statusBusca: string = 'todos';
  ultimaVenda = '0';
  acumuladoGeral = 0;
  acumuladoMes = 0;

  _vendaSelecionada: any = null;
  feedbackRating: number = 0;
  feedbackTexto: string = '';
  starsArray = [1, 2, 3, 4, 5];

  constructor(private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    public zone: NgZone,
    private route: ActivatedRoute) {

    this.platform.ready().then(async () => {

      this.uteisService.buscarRegistros('cliente_').then((data: any) => {
        this._regCliente = data[0];
        this.onAtualizaVendas();
      })

    })
  };

  onCarregaVendas() {

    this.uteisService.buscarRegistros('vendas_').then((data: any) => {
      if (data.length > 0) {

        this._regVendas = data
        this._regVendasBase = data
        let totalGeral = 0;
        let totalMes = 0;

        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();

        for (let venda of this._regVendas) {

          let _nRazao = venda.id_parceiro.razao_social.split(' ')
          venda.id_parceiro.razao_social_ = _nRazao[0]

          if (_nRazao.length > 1) {
            if (_nRazao[1].length > 2) {
              venda.id_parceiro.razao_social_ = _nRazao[0] + ' ' + _nRazao[1];
            } else if (_nRazao[2].length > 2) {
              venda.id_parceiro.razao_social_ = _nRazao[0] + ' ' + _nRazao[2];
            }
          }

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

  onFiltraVendas(_status: string) {
    if (this.statusBusca == 'todos') {
      this._regVendas = this._regVendasBase;
    } else {
      this._regVendas = this._regVendasBase.filter((venda: any) => venda.status_negocio == _status);
    }
  }



  async onAtualizaVendas() {

    let _url = '/_bd?c=vendas'
    _url += "&pop=id_parceiro"
    _url += "&id_cliente=" + this._regCliente._id
    _url += "&_sort=editado_em"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {
        await this.uteisService.salvarBase('vendas_', data).then(() => {
          console.log(JSON.stringify(data))
          this.onCarregaVendas();
        })
      });

  };

  onFormataData(_date: any) {

    return moment(_date).format("DDMMMYY HH[h]mm")

  }

  onAbrirModalVenda(venda: any) {
    this._vendaSelecionada = venda;
    // Se já existe feedback, carrega os dados
    if (venda.feedback) {
      if (Array.isArray(venda.feedback) && venda.feedback.length > 0 && typeof venda.feedback[0] === 'object') {
        this.feedbackRating = venda.feedback[0].rating || 0;
        this.feedbackTexto = venda.feedback[0].texto || '';
      } else if (typeof venda.feedback === 'object' && !Array.isArray(venda.feedback)) {
        // Se feedback é um objeto (ex: {_id: "..."}), converte para array
        this.feedbackRating = venda.feedback.rating || 0;
        this.feedbackTexto = venda.feedback.texto || '';
      } else {
        this.feedbackRating = 0;
        this.feedbackTexto = '';
      }
    } else {
      this.feedbackRating = 0;
      this.feedbackTexto = '';
    }
    this.modalDetalheVenda.present();
  }

  onFecharModal() {
    this.modalDetalheVenda.dismiss();
    this._vendaSelecionada = null;
    this.feedbackRating = 0;
    this.feedbackTexto = '';
  }

  onSetRating(rating: number) {
    this.feedbackRating = rating;
  }

  async onSalvarFeedback() {
    if (this.feedbackRating === 0) {
      this.uteisService.onToast('Por favor, selecione uma avaliação com estrelas', 3000, 'bottom', 'error');
      return;
    }

    if (!this._vendaSelecionada) {
      return;
    }

    const feedbackData: any = {
      rating: this.feedbackRating,
      texto: this.feedbackTexto,
      data: new Date().toISOString()
    };

    // Atualiza a venda com o feedback
    const vendaAtualizada = JSON.parse(JSON.stringify(this._vendaSelecionada));

    // Normaliza feedback para array
    if (!vendaAtualizada.feedback) {
      vendaAtualizada.feedback = [];
    } else if (!Array.isArray(vendaAtualizada.feedback)) {
      // Se feedback é um objeto, converte para array
      const existingFeedback = vendaAtualizada.feedback;
      vendaAtualizada.feedback = [existingFeedback];
    }

    // Se já existe feedback, atualiza. Se não, adiciona novo
    if (vendaAtualizada.feedback.length > 0 && typeof vendaAtualizada.feedback[0] === 'object') {
      // Preserva _id se existir
      if (vendaAtualizada.feedback[0]._id) {
        feedbackData._id = vendaAtualizada.feedback[0]._id;
      }
      vendaAtualizada.feedback[0] = feedbackData;
    } else {
      // Adiciona novo feedback
      vendaAtualizada.feedback = [feedbackData];
    }

    this.uteisService.onLoading('Salvando feedback...', 2000);

    this.apiService.pathServer('/_bd/vendas', vendaAtualizada).then(async (res: any) => {
      // Atualiza a venda localmente
      await this.uteisService.salvarRegistro('vendas_', vendaAtualizada);

      // Atualiza a lista
      this.onCarregaVendas();

      this.uteisService.onToast('Feedback registrado com sucesso! 😊', 3000, 'bottom', 'normal');
      this.onFecharModal();
    }).catch((error: any) => {
      this.uteisService.onToast('Erro ao salvar feedback', 3000, 'bottom', 'error');
      console.error('Erro ao salvar feedback:', error);
    });
  }

  onFormataStatus(status: string) {
    const statusMap: any = {
      'em_aberto': 'Em Aberto',
      'em_andamento': 'Em Andamento',
      'fechado': 'Fechado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  }

}
