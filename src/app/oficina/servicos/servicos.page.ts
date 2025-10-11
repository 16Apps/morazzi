import { Component } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { UteisService } from '../../services/uteis.service';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

import { OrcamentoDetalhePage } from '../../orcamento-detalhe/orcamento-detalhe.page';

import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-servicos',
  templateUrl: './servicos.page.html',
  styleUrls: ['./servicos.page.scss'],
})
export class ServicosPage {

  @ViewChild('modalPerfil') modalPerfil!: IonModal;

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

  readonly cnpjMask: MaskitoOptions = {
    mask: [
      /\d/, /\d/, '.',
      /\d/, /\d/, /\d/, '.',
      /\d/, /\d/, /\d/, '/',
      /\d/, /\d/, /\d/, /\d/, '-',
      /\d/, /\d/
    ],
  };

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();

  _regOficina: any = {};
  _regVeiculosMotorista: any = []


  constructor(
    private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navCtrl: NavController,
    private camera: Camera) {

    this.platform.ready().then(async () => {

      this.uteisService.buscarRegistros('oficina_').then((data: any) => {
        this._regOficina = data[0];
        this.onAtualizaDadosConta();
      });

    });

  };

  ngOnInit() {
  }

  async onAtualizaDadosConta() {

    let _regVeiculosMotorista: any = []
    let _url = "/_checkkm?c=veiculos_motoristas"
    _url += "&pop=id_veiculo"
    _url += "&pop=id_motorista"

    await this.apiService.getServer(_url, 2000)
      .then(async (data: any) => {
        await this.uteisService.salvarBase('veiculos_motoristas_', data)
        _regVeiculosMotorista = data;
      });

    for (let i = 0; i < _regVeiculosMotorista.length; i++) {

      _url = "/_checkkm?c=servicos"
      _url += "&id_veiculo=" + _regVeiculosMotorista[i].id_veiculo._id
      _url += "&sort=data_abertura"
      _url += "&lookup=servicos-itens:_id:id_servico:itens"
      // consulta de campos diferente de null ou pegar periodo

      await this.apiService.getServer(_url, 2000)
        .then(async (data: any) => {

          _regVeiculosMotorista[i]["servico"] = undefined
          if (data.length > 0) {
            _regVeiculosMotorista[i].servico = data[0]
            // await this.uteisService.salvarRegistro('veiculos_motoristas_', this._regVeiculosMotorista[i])
          };

        });
    };

    this._regVeiculosMotorista = _regVeiculosMotorista.filter((item: any) => item.servico != undefined)
    for (let i = 0; i < this._regVeiculosMotorista.length; i++) {
      for (let s = 0; s < this._regVeiculosMotorista[i].servico.itens.length; s++) {
        this._regVeiculosMotorista[i].servico.itens[s]['escolha_fabricante'] = ""
        this._regVeiculosMotorista[i].servico.itens[s]['quantidade'] = 0
        this._regVeiculosMotorista[i].servico.itens[s]['valor'] = '0,00'
        this._regVeiculosMotorista[i].servico.itens[s]['valor_total'] = '0,00'
      };
    };

    this.onCarregaOrcamentos()

  };

  async onCarregaOrcamentos() {

    for (let i = 0; i < this._regVeiculosMotorista.length; i++) {

      this._regVeiculosMotorista[i]['orcamento'] = undefined

      let _url = "/_checkkm?c=orcamentos"
      _url += "&id_servico=" + this._regVeiculosMotorista[i].servico._id
      _url += "&id_oficina=" + this._regOficina._id

      await this.apiService.getServer(_url, 2000)
        .then(async (data: any) => {

          if(data.length > 0){
            this._regVeiculosMotorista[i]['orcamento'] = data[0]
          };

        });
    };

  };

  async onOrcamento(reg: any) {
    const modal = await this.modalController
      .create({
        component: OrcamentoDetalhePage,
        componentProps: {
          returnPage: 'oficina',
          _regVeiculosMotorista: reg,
          _regOficina: this._regOficina
        },
      });

    modal.present();

    modal.onDidDismiss().then(async data => {
      this.onCarregaOrcamentos();
    });
  };

  abrirModalPerfil() {
    this.modalPerfil.present();
  };

  onBuscaCep() {

    this.uteisService.onLoading('Pesquisando...', 3000)

    let _url = 'https://viacep.com.br/ws/' + this._regOficina.cep.replace('.', '').replace('-', '') + '/json/'
    this.apiService.getServer(_url, 3000)
      .then((res: any) => {

        setTimeout(() => {

          this.uteisService.onHideLoading();
          if (res.erro) {
            this.uteisService.onToast('CEP inválido!', 2000, 'middle', 'normal');
            return
          };

          this._regOficina.logradouro = res.logradouro
          this._regOficina.bairro = res.bairro
          this._regOficina.cidade = res.localidade
          this._regOficina.estado = res.estado
          this._regOficina.pais = 'Brasil'

        }, 2000);

      })
      .catch((error) => {
        this.uteisService.onToast('Algo deu errado. Tente novamente.', 2000, 'middle', 'normal');
        this.uteisService.onHideLoading();
      });

  };


  async onLogo() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL, // base64
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY // ou .CAMERA
    };

    try {
      const imageData = await this.camera.getPicture(options);

      this.apiService.postServer('/checkkm/save', [{ foto: imageData }]).then((res: any) => {
        res = JSON.parse(res)
      })


      this._regOficina.logo = imageData;
      console.log(imageData)
    } catch (err) {
      console.error('Erro ao selecionar imagem:', err);
    }
  }

  async onAtualizaOficina() {

    this.apiService.pathServer('/_checkkm/oficinas', this._regOficina).then((res) => {
      this.uteisService.salvarBase('oficina_', [this._regOficina])
      this.uteisService.onToast('Dados Atualizado', 2000, 'bottom', 'normal');

      setTimeout(() => {
        this.modalPerfil.dismiss();
      }, 1200);

    });

  };

  formataData(data: any) {
    return moment(data).format("DDMMM")
  }

    onFormataReal(valor: any) {

    valor = parseFloat(valor.toString());
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  };

    async onSair() {

    await this.uteisService.limparBase('oficina_')
    await this.uteisService.limparBase('motorista_')
    await this.uteisService.limparBase('veiculos_motoristas_')

    this.navCtrl.navigateRoot('');

  }


}
