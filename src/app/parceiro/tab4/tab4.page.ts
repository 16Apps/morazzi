import { Component, NgZone } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { UteisService } from '../../services/uteis.service';

import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page {

  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  };
  readonly cpfMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/],
  };
  readonly cnpjMask: MaskitoOptions = {
    mask: [
      /\d/, /\d/, '.',
      /\d/, /\d/, /\d/,
      '.',
      /\d/, /\d/, /\d/,
      '/',
      /\d/, /\d/, /\d/, /\d/,
      '-',
      /\d/, /\d/
    ],
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

  _regParceiro: any = undefined;
  _regSegmentos: any = [];

  constructor(
    private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    public zone: NgZone) {

    this.platform.ready().then(async () => {

      this.onCarregaSegmentos();

      this.uteisService.buscarRegistros('parceiro_').then((data: any) => {
        this._regParceiro = data[0];

        let _nome = this._regParceiro.razao_social.split(" ");
        this._regParceiro['_nome'] = _nome[0].trim();

        this._regParceiro['_sobrenome'] = "";
        for (let i = 0; i < _nome.length; i++) {
          if (i > 0) {
            this._regParceiro._sobrenome += _nome[i] + " ";
          }
        };
        this._regParceiro._sobrenome = this._regParceiro._sobrenome.trim();

        this._regParceiro['_logo'] = 'https://media.lordicon.com/icons/wired/lineal/44-avatar-user-in-circle.svg'
        if (this._regParceiro.foto != '') {
          this._regParceiro._logo = this.apiService.baseUrl + '/image/' + this._regParceiro.logo
        };

      });

    });

  };


  ngOnInit() {
  }

  async onCarregaSegmentos() {

    let _url = '/_bd?c=segmentos'
    _url += "&sort=segmento"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {


        this._regSegmentos = data

      });

  };

  onLogoPerfil() {
    this.uteisService.onFoto().then((res) => {
      this._regParceiro._logo = this.apiService.baseUrl + '/image/' + res
      this._regParceiro.logo = res
    })
  }

  onCadastro() {

    this.apiService.pathServer('/_bd/parceiros', this._regParceiro).then((res: any) => {

      this.uteisService.salvarBase('parceiro_', [this._regParceiro])
      this.uteisService.onToast('Dados atualizados, com sucesso!', 2000, 'bottom', 'normal');
    })
  }

  onBuscaCep() {

    this.uteisService.onLoading('Pesquisando...', 3000)

    let _url = 'https://viacep.com.br/ws/' + this._regParceiro.cep.replace('.', '').replace('-', '') + '/json/'
    this.apiService.getServer(_url, 3000)
      .then((res: any) => {

        setTimeout(() => {

          this.uteisService.onHideLoading();
          if (res.erro) {
            this.uteisService.onToast('CEP inválido!', 2000, 'middle', 'normal');
            return
          };

          this._regParceiro.logradouro = res.logradouro
          this._regParceiro.bairro = res.bairro
          this._regParceiro.cidade = res.localidade
          this._regParceiro.estado = res.estado
          this._regParceiro.pais = 'Brasil'

        }, 2000);

      })
      .catch((error) => {
        this.uteisService.onToast('Algo deu errado. Tente novamente.', 2000, 'middle', 'normal');
        this.uteisService.onHideLoading();
      });

  };

  async onSair() {
    this.uteisService.limparBase('cliente_')
    this.uteisService.limparBase('parceiro_')
    this.uteisService.limparBase('vendas_')
    this.navCtrl.navigateRoot('login');
  }


  isChecked(id: string) {
    return this._regParceiro.segmentos.includes(id);
  };

  toggleSegmento(id: string, checked: boolean) {
    if (checked) {
      this._regParceiro.segmentos.push(id);
    } else {
      this._regParceiro.segmentos =
        this._regParceiro.segmentos.filter((s: any) => s._id !== id);
    };
  };

}
