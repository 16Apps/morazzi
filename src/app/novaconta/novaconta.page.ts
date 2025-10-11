
import { Component, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import { Tab1Page } from '../tab1/tab1.page';
import { TabsPage } from '../tabs/tabs.page';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-novaconta',
  templateUrl: './novaconta.page.html',
  styleUrls: ['./novaconta.page.scss'],
})
export class NovacontaPage {

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @ViewChild('modalKm') modal!: IonModal;
  @ViewChild('modalConsultaPlaca') modalPlaca!: IonModal;
  @ViewChild('modalCadastro') modalCadastro!: IonModal;

  _etapa = 'celular'

  countries = [
    { name: 'Brasil', ddi: '55', flag: '🇧🇷' },
    { name: 'Argentina', ddi: '54', flag: '🇦🇷' },
    { name: 'Chile', ddi: '56', flag: '🇨🇱' },
    { name: 'Colômbia', ddi: '57', flag: '🇨🇴' },
    { name: 'Peru', ddi: '51', flag: '🇵🇪' },
    { name: 'Estados Unidos', ddi: '1', flag: '🇺🇸' },
    { name: 'Reino Unido', ddi: '44', flag: '🇬🇧' },
    { name: 'Alemanha', ddi: '49', flag: '🇩🇪' },
    { name: 'Japão', ddi: '81', flag: '🇯🇵' },
    { name: 'Austrália', ddi: '61', flag: '🇦🇺' }
  ];

  selectedCountry: string = '55'; // Brasil default
  _chave: string = '';
  _chave1: string = '';
  _chave2: string = '';
  _chave3: string = '';
  _chave4: string = '';

  timer: any;
  timeLeft: number = 59;
  timerText: string = 'Reenviar Código em 0:59';

  _sexos = [
    { name: 'Masculino', sexo: 'masculino', icon: '🚹' },
    { name: 'Feminino', sexo: 'feminino', icon: '🚺' },
    { name: 'Outro', sexo: 'outro', icon: '⚧️' },
  ]

  _placa1: string = '';
  _placa2: string = '';
  _placa3: string = '';
  _placa4: string = '';
  _placa5: string = '';
  _placa6: string = '';
  _placa7: string = '';

  moveFocus(event: any, index: number) {
    const input = event.target;
    if (input.value.length >= 1) {
      const nextInput = this.otpInputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }
  };

  handleBackspace(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && input.value === '') {
      const prevInput = this.otpInputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }
  };

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

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();

  _editCliente: any = {

    _id: this.uteisService.autoID(),
    ativo: '1',
    nome: '',
    genero: 'masculino',
    foto: '',
    _foto: 'https://media.lordicon.com/icons/wired/lineal/44-avatar-user-in-circle.svg',
    qualificacao: 5,
    cpf: '',
    telefone: '',
    celular: '',
    email: '',
    segmentos: [],

    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      cidade: '',
      estado: '',
      pais: '',
      cep: '',
    },
    criado_em: moment().format("YYYY-MM-DD HH:mm:ss"),
    editado_em: moment().format("YYYY-MM-DD HH:mm:ss")

  };

  constructor(private platform: Platform,
    private navCtrl: NavController,
    private modalController: ModalController,
    private apiService: ApiService,
    private uteisService: UteisService,
  ) {
    this.platform.ready().then(async () => {

      // this.uteisService.buscarRegistros('cliente_').then((data: any) => {
      //   alert(JSON.stringify(data))
      // })


    });
  }

  ngOnInit() {
  }

  onMudaEtapa() {

    if (this._etapa == 'celular') {

      this.onEnviaChave();
      this._etapa = 'chave';

    } else if (this._etapa == 'chave') {

      let chaveInf = this._chave1 + this._chave2 + this._chave3 + this._chave4
      if (chaveInf != this._chave) {
        this.uteisService.onToast('A Chave informada não confere.', 2000, 'bottom', 'error');
        return;
      };

      this._etapa = 'nome';
      clearInterval(this.timer);

    } else if (this._etapa == 'nome') {

      if (this._editCliente.nome == '') {
        this.uteisService.onToast('Seu nome não foi ...', 2000, 'bottom', 'error');
        return;
      };
      this._etapa = 'cep';

    } else if (this._etapa == 'cep') {

      this.uteisService.onLoading('Pesquisando...', 3000)

      let _url = 'https://viacep.com.br/ws/' + this._editCliente.endereco.cep.replace('.', '').replace('-', '') + '/json/'
      this.apiService.getServer(_url, 3000)
        .then((res: any) => {

          setTimeout(() => {

            this.uteisService.onHideLoading();
            if (res.erro) {
              this.uteisService.onToast('CEP inválido!', 2000, 'middle', 'normal');
              return
            };

            this._editCliente.endereco.logradouro = res.logradouro
            this._editCliente.endereco.bairro = res.bairro
            this._editCliente.endereco.cidade = res.localidade
            this._editCliente.endereco.estado = res.estado
            this._editCliente.endereco.pais = 'Brasil'

            this._etapa = "endereco"

          }, 2000);

        })
        .catch((error) => {
          this.uteisService.onToast('Algo deu errado. Tente novamente.', 2000, 'middle', 'normal');
          this.uteisService.onHideLoading();
        });

    } else if (this._etapa == "endereco") {

      this.modalCadastro.present();
      this.onCadastro()

    }

  };

  onEnviaChave() {

    this.timeLeft = 59;
    this.startTimer();

    this._chave = this.uteisService.gerarChave();

    this.uteisService.sendWhats(this._editCliente.celular, 'Sua chave _Morazzi_ é *' + this._chave + '* 🤩🏠😎🎨').then(() => {
      this.uteisService.onToast('Sua chave de acesso foi enviada para o seu WhatsApp.', 2000, 'bottom', 'normal');
    });

  };


  onVoltaEtapa() {

    if (this._etapa == 'endereco') {
      this._etapa = 'cep';

    } else if (this._etapa == 'cep') {
      this._etapa = 'nome';

    } else if (this._etapa == 'nome') {
      this._etapa = 'chave';

    } else if (this._etapa == 'chave') {

      this._etapa = 'celular';

    } else if (this._etapa == 'celular') {

      this.fecharModal();

    };

  }


  onCadastro() {

    this._editCliente.nome = this._editCliente.nome.trim();

    this.apiService.pathServer('/_bd/clientes', this._editCliente).then((res: any) => {

      this.uteisService.salvarBase('cliente_', [this._editCliente])

      setTimeout(() => {
        this.modalCadastro.dismiss();
        this.uteisService.onToast('Suas experiências começam agora!', 2000, 'bottom', 'normal');

        setTimeout(() => {
          this.navCtrl.navigateRoot('tabs/tab1');
          setTimeout(async () => {
            await this.modalController.dismiss();
          }, 200);
        }, 1200);
      }, 4000);

    })

  }

  startTimer() {
    this.updateTimerText();

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateTimerText();
      } else {
        clearInterval(this.timer);
        this.onEnviaChave();
      }
    }, 1000);
  }

  updateTimerText() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.timerText = `Reenviar Código em ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }



  async fecharModal() {
    await this.modalController.dismiss();
  }




}
