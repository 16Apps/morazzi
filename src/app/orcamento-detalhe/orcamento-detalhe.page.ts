import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Platform, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-orcamento-detalhe',
  templateUrl: './orcamento-detalhe.page.html',
  styleUrls: ['./orcamento-detalhe.page.scss'],
})
export class OrcamentoDetalhePage {
  returnPage: string = '';
  _regVeiculosMotorista: any = {};
  _regOficina: any = {};
  _regOrcamento: any = {}

  constructor(private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navParams: NavParams) {

    this.platform.ready().then(async () => {


      this.returnPage = this.navParams.get('returnPage');
      this._regOficina = this.navParams.get('_regOficina');

      this._regVeiculosMotorista = this.navParams.get('_regVeiculosMotorista');

      if (this.returnPage == "orcamentos") {
        this._regVeiculosMotorista["servico"] = this._regVeiculosMotorista.id_servico
      };

      this.onCarregaOrcamento();

    });

  };

  ngOnInit() {
  };

  async onCarregaOrcamento() {

    let _url = "/_checkkm?c=orcamentos"
    _url += "&id_servico=" + this._regVeiculosMotorista.servico._id
    _url += "&id_oficina=" + this._regOficina._id

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {

        if (data.length > 0) {
          this._regOrcamento = data[0];

          this._regOrcamento.total_itens = this.onFormataReal(this._regOrcamento.total_itens)
          for (let i = 0; i < this._regOrcamento.servicos_itens.length; i++) {
            this._regOrcamento.servicos_itens[i].valor = this.onFormataReal(this._regOrcamento.servicos_itens[i].valor)
            this._regOrcamento.servicos_itens[i].valor_total = this.onFormataReal(this._regOrcamento.servicos_itens[i].valor_total)
          };

          this.onCalculoTotal();
        } else {
          this.onNovoOrcamento()
        }

      });

  }

  onNovoOrcamento() {

    this._regOrcamento = {

      _id: this.uteisService.autoID(),

      id_motorista: this._regVeiculosMotorista.id_motorista._id,
      id_veiculo: this._regVeiculosMotorista.id_veiculo._id,
      id_oficina: this._regOficina._id,
      id_servico: this._regVeiculosMotorista.servico._id,

      data_proposta: moment().format("YYYY-MM-DD HH:mm:ss"),

      servicos_itens: this._regVeiculosMotorista.servico.itens,

      total_itens: 0,
      desconto: 0,
      total: 0,

      observacoes_servicos: null,
      condicao_pagamento: null,

      data_agendamento_opcao1: null,
      data_agendamento_opcao2: null,
      data_agendamento_opcao3: null,

      motorista_retorno: 'pendente',
      motorista_data_retorno: null,

      chat_duvida: [],

    }

    this.onCalculoTotal();

  }

  onCalculoQnt(i: any, index: any) {

    let _vl = parseFloat(this._regOrcamento.servicos_itens[index].valor.replace('.', '').replace(',', '.'))
    this._regOrcamento.servicos_itens[index].valor_total = this.onFormataReal(_vl * parseInt(i.target.value));
    this.onCalculoTotal()

  };

  onCalculoTotal() {

    this._regOrcamento.total = 0
    for (let i = 0; i < this._regOrcamento.servicos_itens.length; i++) {
      let _vl = parseFloat(this._regOrcamento.servicos_itens[i].valor_total.replace('.', '').replace(',', '.'))
      this._regOrcamento.total += _vl
    };

    this._regOrcamento.total_itens = this.onFormataReal(this._regOrcamento.total);

    if (this._regOrcamento.desconto > 0) {
      let _desconto = (this._regOrcamento.total * this._regOrcamento.desconto) / 100
      this._regOrcamento.total = this._regOrcamento.total - _desconto
      this._regOrcamento.desconto = parseInt(this._regOrcamento.desconto.toString())
    };

  };

  onRegistraOrcamento() {

    let _regOrc = JSON.parse(JSON.stringify(this._regOrcamento))


    _regOrc.total_itens = _regOrc.total_itens.toString().replace('.', '').replace(',', '.');
    _regOrc.desconto = _regOrc.desconto;
    _regOrc.total = _regOrc.total.toFixed(2);

    for (let i = 0; i < _regOrc.servicos_itens.length; i++) {
      _regOrc.servicos_itens[i].valor = _regOrc.servicos_itens[i].valor.replace('.', '').replace(',', '.');
      _regOrc.servicos_itens[i].valor_total = _regOrc.servicos_itens[i].valor_total.replace('.', '').replace(',', '.');
    }

    this.apiService.pathServer('/_checkkm/orcamentos', _regOrc).then((res) => {
      this.uteisService.onToast('Bom trabalho! Orçamento enviado 😊', 2000, 'bottom', 'normal');

      if (this.returnPage == "orcamentos") {
        setTimeout(() => {
          this.fecharModal();
        }, 1200);
        
      };

    })

    console.log(JSON.stringify(_regOrc))

  }


  onFormataReal(valor: any) {

    valor = parseFloat(valor.toString());
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  };

  formataData(data: any) {
    return moment(data).format("DDMMM")
  }

  async fecharModal() {
    await this.modalController.dismiss([]);
  };

  moedaBRModel(i: any, campo: string, index: any) {

    if (campo == 'valorItem') {
      let _vl = parseFloat(i.target.value.replace('.', '').replace(',', '.'))
      this._regOrcamento.servicos_itens[index].valor_total = this.onFormataReal(_vl * parseInt(this._regOrcamento.servicos_itens[index].quantidade));
      this._regOrcamento.servicos_itens[index].valor = i.target.value;
      this.onCalculoTotal()
    };

    return this.uteisService.moedaBR2(i);

  };

  moedaBR(i: any, index: any) {
    return this.uteisService.moedaBR2(i);
  };

}
