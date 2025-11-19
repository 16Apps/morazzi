import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavController, ModalController, IonModal } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { UteisService } from '../../services/uteis.service';
import { ActivatedRoute } from '@angular/router';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})

export class Tab5Page {

  @ViewChild('modalRegistroVenda') modalRegistroVenda!: IonModal;

  _editVenda: any = undefined;
  _regParceiro: any = undefined;
  _regVendas: any = [];

  showValues: boolean = true;

  ultimaVenda = '0';
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
    mask: [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
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
    private route: ActivatedRoute) {

    this.platform.ready().then(async () => {

      this.uteisService.buscarRegistros('parceiro_').then((data: any) => {
        this._regParceiro = data[0];
      })

      this.onCarregaVendas();

    })
  }

  ngOnInit() {
  }

  onCarregaVendas() {

    this.uteisService.buscarRegistros('vendas_').then((data: any) => {

  
      if (data.length > 0) {

        this._regVendas = data
        console.log(JSON.stringify(this._regVendas))
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
        this.acumuladoMes =  totalMes;
      }
    })
  }

  onEditarVenda(_reg: any) {
    if (_reg == undefined) {

      this._editVenda = {
        _id: this.uteisService.autoID(),
        ativo: 1,
        id_parceiro: this._regParceiro._id,
        id_cliente: undefined,
        _busca_cpf: '',
        valor_total: '0,00',
        doc_venda: '',
        detalhes: '',
        status_negocio: 'fechado',
        criado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
        editado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
        edit: 'add'
      };

    } else {
      this._editVenda = _reg;
      this._editVenda.valor_total = this._editVenda.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      this._editVenda.edit = 'edit';
    };

    this.modalRegistroVenda.present();
  };

  async onBuscaCliente() {
    let _url = '/_bd?c=clientes'
    _url += "&cpf=" + this._editVenda._busca_cpf;

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {

        if (data.length > 0) {
          this._editVenda.id_cliente = data[0]
        } else {
          this.uteisService.onToast('Cliente não localizado.', 4000, 'bottom', 'error');
        }

      });
  };

  async onRegistraVenda() {

    let _reg = JSON.parse(JSON.stringify(this._editVenda))
    const valorBR = _reg.valor_total;
    _reg.valor_total = this.converterBRparaUSA(valorBR);

    this.apiService.pathServer('/_bd/vendas', _reg).then(async (res: any) => {

      if (this._editVenda.edit == 'add') {
        let _cashBack = this._editVenda.id_cliente.cashback ? this._editVenda.id_cliente.cashback : 0
        this._editVenda.id_cliente.cashback = _cashBack + parseInt(_reg.valor_total)
        this.apiService.pathServer('/_bd/clientes', this._editVenda.id_cliente)
      };

      if (this._regVendas.length == 0) {
        await this.uteisService.salvarBase('vendas_', [_reg])
      } else {
        await this.uteisService.salvarRegistro('vendas_', _reg)
      }

      this.onCarregaVendas();

      this.uteisService.onToast('Venda Registrada 😁', 4000, 'bottom', 'normal');
      this.modalRegistroVenda.dismiss()
    })
  };

  formatarMoedaBR(event: any) {
    let v = event.target.value;

    // Remove qualquer coisa que não seja número
    v = v.replace(/\D/g, "");

    if (v.length === 0) {
      event.target.value = "";
      return;
    }

    // coloca duas casas decimais
    v = (parseInt(v, 10) / 100).toFixed(2);

    // substitui o ponto decimal por vírgula
    let valor = v.replace(".", ",");

    // insere separador de milhar
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    event.target.value = valor;

    // IMPORTANTE: Model não deve receber esse valor formatado!
    this._editVenda.valor_total = valor;
  }


  converterBRparaUSA(valor: string): number {
    if (!valor) return 0;

    // remove milhar
    valor = valor.replace(/\./g, "");

    // troca vírgula por ponto
    valor = valor.replace(",", ".");

    return parseFloat(valor);
  }

  onFecharVenda() {
    this.modalRegistroVenda.dismiss();
  }

  onFormataData(_date: any) {

    return moment(_date).format("DDMMMYY HH[h]mm")

  }






}
