import { Component, OnInit } from '@angular/core';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';

import { GoogleAuthService } from '../services/google-auth.service';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';

import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

import { NovacontaPage } from '../novaconta/novaconta.page';

import * as moment from 'moment';
moment.locale('pt-br');

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

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

  modo: string = 'motorista'
  etapaAcesso: string = 'bemvindo'
  backgroundImage: string = "url('../../assets/image/_fundoLogin.jpg')";

  uuidDevice: string = '';
  celular: string = '';
  chave: string = '';
  chave_: string = '';
  nome: string = '';

  _regMotorista: any = []
  _editMotorista: any = {}
  _bioOk: boolean = false;

  _regOficina: any = []
  _editOficina: any = {}




  constructor(
    private googleAuth: GoogleAuthService,
    private uteisService: UteisService,
    private apiService: ApiService,
    private platform: Platform,
    private navCtrl: NavController,
    private modalController: ModalController,
    private device: Device,
    private faio: FingerprintAIO) {

    this.platform.ready().then(async () => {
      this.uuidDevice = this.device.uuid.substring(0, 4) + '-' + this.device.uuid.substring(4, 8)
      this.uuidDevice = this.uuidDevice.toUpperCase()
    });

  };

  ngOnInit() {
  }




  async abrirLoginGoogle() {

    
    const token = await this.googleAuth.loginWithGoogle();
    let i = token.toString()

    if (token) {
      console.log('Token recebido:', token);
      this.apiService.postServer('/api/login-google', { token }).then((res: any) => {
        alert(JSON.stringify(res));
      });
    } else {
      console.log('Login cancelado ou falhou.');
    }
  }

  async onNovaConta() {

    const modal = await this.modalController
      .create({
        component: NovacontaPage,
        componentProps: {
          returnPage: 'login'
        },
      });

    modal.present();

    modal.onDidDismiss().then(async data => {
      // await this.onListaPedidos();
      // this.onDadosLocais(false);
    });

    // this.navCtrl.navigateRoot('novaconta');
  }

  async onMudaModo() {

    if (this.modo == 'motorista') {
      this.modo = 'oficina'
    } else {
      this.modo = 'motorista'
    }

    this.onMudaEtapa()

  }


  async onMudaEtapa() {

    if (this.etapaAcesso == 'bemvindo') {

      this.etapaAcesso = 'celular';
      this.backgroundImage = "url('../../assets/image/fundo_login_celular.png')";

    } else if (this.etapaAcesso == 'celular') {

      if (this.celular == '' || this.celular.length < 15) {
        this.uteisService.onToast('Informe um número de celular válido.', 2000, 'bottom', 'error');
        return;
      };

      this.chave_ = this.uteisService.gerarChave();

      this.uteisService.sendWhats(this.celular, 'Sua chave _itour_ é *' + this.chave_ + '* 🚗🏍️🚛🚀').then(() => {
        this.uteisService.onToast('Sua chave de acesso foi enviada para o seu WhatsApp.', 2000, 'bottom', 'normal');
        this.uteisService.onHideLoading();
      });

      this.etapaAcesso = 'whatsapp';
      this.backgroundImage = "url('../../assets/image/fundo_login_whatsapp.png')";

    } else if (this.etapaAcesso == 'whatsapp') {

      if (this.chave == '' || this.chave != this.chave_) {
        this.uteisService.onToast('A Chave não está correta.', 2000, 'bottom', 'error');
        return;
      };

      this.uteisService.onLoading('Processando...', 3000)

      if (this.modo == 'motorista') {

        this.apiService.getServer('/_checkkm?c=motoristas&celular=' + this.celular, 2000).then(
          (data: any) => {

            if (data.length == 0) {

              this.uteisService.onHideLoading();

              this.etapaAcesso = 'nome';
              this.backgroundImage = "url('../../assets/image/fundo_login_nome.png')";

            } else {

              this._editMotorista = data[0];
              this.onAuthBio(false);

            };

          },
          (error: any) => {
            this.uteisService.onToast('Verifique sua conexão com a internet.', 2000, 'middle', 'error')
            this.uteisService.onHideLoading();
          });

      } else if (this.modo == 'oficina') {

        this.apiService.getServer('/_checkkm?c=oficinas&celular=' + this.celular, 2000).then(
          (data: any) => {

            if (data.length == 0) {

              this.uteisService.onHideLoading();

              this.etapaAcesso = 'nome_oficina';
              this.backgroundImage = "url('../../assets/image/fundo_login_motorista.png')";

            } else {

              this._editOficina = data[0];
              this.onAuthBio(false);

            };

          },
          (error: any) => {
            this.uteisService.onToast('Verifique sua conexão com a internet.', 2000, 'middle', 'error')
            this.uteisService.onHideLoading();
          });

      }

      // this.etapaAcesso = 'bemvindo';
      // this.backgroundImage = "url('../../assets/image/fundo_login.png')";

    } else if (this.etapaAcesso == 'nome') {

      if (!this.nome) {
        this.uteisService.onToast('Esqueceu do seu nome 😅', 2000, 'middle', 'error')
        return;
      };

      let _nome = this.nome.split(' ')
      let _sobrenome = '';
      if (_nome.length > 1) {
        for (let i = 0; i < _nome.length; i++) {
          if (i > 0) {
            _sobrenome += _nome[i] + ' '
          }
        }
      }

      this._editMotorista = {
        _id: this.uteisService.autoID(),

        nome: _nome[0].trim(),
        sobrenome: _sobrenome ? _sobrenome.trim() : '',
        pessoa: 'fisica',
        cnpj_cpf: '',

        foto: '',
        qualificacao: 5,

        data_cadastro: moment().format("YYYY-MM-DD HH:mm:ss"),
        ativo: '1',

        celular: this.celular,
        telefone: '',
        email: '',

        cep: '',
        _logradouro: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        pais: '',

        data_acesso: '',
        data_servico: ''
      };

      this.onAuthBio(true);

    } else if (this.etapaAcesso == 'nome_oficina') {

      if (!this._editOficina.nome) {
        this.uteisService.onToast('Esqueceu do nome da Oficina 😅', 2000, 'middle', 'error')
        return;
      };

      this._editOficina = {
        _id: this.uteisService.autoID(),

        pessoa: 'empresa',
        cnpj_cpf: '',

        nome: this._editOficina.nome,
        sobrenome: '',

        data_cadastro: moment().format("YYYY-MM-DD HH:mm:ss"),
        ativo: '1',
        logo: '',
        qualificacao: 5,

        celular: this.celular,
        telefone: '',
        email: '',

        foto_capa: '',
        slogan: '',
        data_inicial_atividade: '',
        detalhes: '',

        foto1: '',
        foto2: '',
        foto3: '',

        link_video: '',

        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        pais: '',

        data_acesso: '',
        data_servico: ''
      }

      this.onAuthBio(true);

    }

  }

  async onAuthBio(novoCad: boolean) {

    let _exAcesso = (bioAtiva: boolean) => {

      this._editMotorista['bioAtiva'] = bioAtiva;

      if (this.modo == 'motorista') {
        this.apiService.pathServer('/_checkkm/motoristas', this._editMotorista).then((res: any) => {
          this.uteisService.salvarBase('motorista_', [this._editMotorista])

          this.uteisService.onToast('Seja bem-vindo!', 2000, 'bottom', 'normal');
          setTimeout(() => {
            this.navCtrl.navigateRoot('tabs/tab1');
          }, 1200);
        });

      } else if (this.modo == 'oficina') {
        this.apiService.pathServer('/_checkkm/oficinas', this._editOficina).then((res: any) => {
          this.uteisService.salvarBase('oficina_', [this._editOficina])

          this.uteisService.onToast('Seja bem-vindo!', 2000, 'bottom', 'normal');
          setTimeout(() => {
            this.navCtrl.navigateRoot('oficina/servicos');
          }, 1200);
        });
      }

    };

    this.faio.isAvailable({ requireStrongBiometrics: false })
      .then((biometricType) => {

        this.etapaAcesso = 'bio';
        this.backgroundImage = "url('../../assets/image/fundo_login_bio.png')";

        setTimeout(() => {
          this.faio.show({
            title: 'Autenticação',
            subtitle: 'Acesso Seguro',
            description: 'Use sua biometria para continuar',
            fallbackButtonTitle: 'Usar Senha',
            disableBackup: false,
          })
            .then(() => {
              _exAcesso(true)
            })
            .catch((error) => {
              this.uteisService.onToast('Falha na autenticação', 2000, 'bottom', 'error');
            });
        }, 2000);

      })
      .catch((error) => {
        _exAcesso(false)
      });

  };



  onAcesso(event: any) {

    if (event == 'acesso') {

      if (!this.chave || !this.chave_ || !this.celular) {
        this.uteisService.onToast('Informe os dados de Acesso.', 2000, 'middle', 'error');
        return;
      };

      if (this.chave == this.chave_) {

        this.uteisService.salvarBase('motorista_', this._regMotorista)

        this.uteisService.onToast('Tudo certo, vamos lá!', 2000, 'middle', 'normal');
        setTimeout(() => {
          this.navCtrl.navigateRoot('tabs/tab1');
        }, 1200);

      } else {

        this.uteisService.onToast('A Chave não confere.', 2000, 'middle', 'error');

      };

      return;
    };

    if (this.celular.length == 15) {

      this.uteisService.onLoading('Processando...', 3000)

      setTimeout(() => {

        this.apiService.getServer('/_checkkm?c=motoristas&celular=' + this.celular, 2000).then(
          (data: any) => {

            if (data.length == 0) {

              this.uteisService.onHideLoading();

              this.uteisService.questionAlert('Ops..', 'Não localizamos o seu cadastro.', '', 'Repetir', 'Cadastrar').then((res: any) => {
                if (res == 'btn1') {
                  this.celular = ''
                } else {
                  this.onNovaConta()
                }
              })

            } else {

              this._regMotorista = data;

              this.chave_ = this.uteisService.gerarChave();

              this.uteisService.sendWhats(this.celular, 'Sua chave _itour_ é *' + this.chave_ + '* 🚗🏍️🚛🚀. Seja bem novamente! ☺️').then(() => {
                this.uteisService.onToast('Sua chave de acesso foi enviada para o seu WhatsApp.', 2000, 'middle', 'normal');
                this.uteisService.onHideLoading();
              })

            };

          },
          (error: any) => {
            this.uteisService.onToast('Verifique sua conexão com a internet.', 2000, 'middle', 'error')
            this.uteisService.onHideLoading();
          });

      }, 2000);
    };
  };

  capitalizeWords(str: string) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }

}
