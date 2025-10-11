import { Component, NgZone } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';

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

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();

  _regCliente: any = undefined;
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

      this.uteisService.buscarRegistros('cliente_').then((data: any) => {
        this._regCliente = data[0];

        let _nome = this._regCliente.nome.split(" ");
        this._regCliente['_nome'] = _nome[0].trim();

        this._regCliente['_sobrenome'] = "";
        for (let i = 0; i < _nome.length; i++) {
          if (i > 0) {
            this._regCliente._sobrenome += _nome[i] + " ";
          }
        };
        this._regCliente._sobrenome = this._regCliente._sobrenome.trim();

        this._regCliente['_foto'] = 'https://media.lordicon.com/icons/wired/lineal/44-avatar-user-in-circle.svg'
        if (this._regCliente.foto != '') {
          this._regCliente._foto = this.apiService.baseUrl + '/image/' + this._regCliente.foto
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

  onFotoPerfil() {
    this.uteisService.onFoto().then((res) => {
      this._regCliente._foto = this.apiService.baseUrl + '/image/' + res
      this._regCliente.foto = res
    })
  }

  onCadastro() {

    this._regCliente.nome = this._regCliente._nome + ' ' + this._regCliente._sobrenome
    this._regCliente.nome = this._regCliente.nome.trim()

    this.apiService.pathServer('/_bd/clientes', this._regCliente).then((res: any) => {

      this.uteisService.salvarBase('cliente_', [this._regCliente])
      this.uteisService.onToast('Dados atualizados, com sucesso!', 2000, 'bottom', 'normal');
    })
  }

  onBuscaCep() {

    this.uteisService.onLoading('Pesquisando...', 3000)

    let _url = 'https://viacep.com.br/ws/' + this._regCliente.cep.replace('.', '').replace('-', '') + '/json/'
    this.apiService.getServer(_url, 3000)
      .then((res: any) => {

        setTimeout(() => {

          this.uteisService.onHideLoading();
          if (res.erro) {
            this.uteisService.onToast('CEP inválido!', 2000, 'middle', 'normal');
            return
          };

          this._regCliente.logradouro = res.logradouro
          this._regCliente.bairro = res.bairro
          this._regCliente.cidade = res.localidade
          this._regCliente.estado = res.estado
          this._regCliente.pais = 'Brasil'

        }, 2000);

      })
      .catch((error) => {
        this.uteisService.onToast('Algo deu errado. Tente novamente.', 2000, 'middle', 'normal');
        this.uteisService.onHideLoading();
      });

  };

  isChecked(id: string) {
    return this._regCliente.segmentos.includes(id);
  }

  toggleSegmento(id: string, checked: boolean) {
    if (checked) {
      this._regCliente.segmentos.push(id);
    } else {
      this._regCliente.segmentos =
        this._regCliente.segmentos.filter((s: any) => s._id !== id);
    }
  }



}
