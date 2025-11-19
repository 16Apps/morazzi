import { Component, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { Platform, NavController, ModalController, IonModal } from '@ionic/angular';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';

@Component({
  selector: 'app-parceiro-acesso',
  templateUrl: './parceiro-acesso.page.html',
  styleUrls: ['./parceiro-acesso.page.scss'],
})
export class ParceiroAcessoPage {

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @ViewChild('modalContaCadastrada') modalContaCadastrada!: IonModal;

  _etapa: string = 'cnpj';
  _cnpj: string = '';
  _chave: string = '';
  _chave1: string = '';
  _chave2: string = '';
  _chave3: string = '';
  _chave4: string = '';

  timer: any;
  timeLeft: number = 59;
  timerText: string = 'Reenviar Código em 0:59';

  _regParceiro: any = undefined;

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

  readonly cnpjMask: MaskitoOptions = {
    mask: [
      /\d/, /\d/, '.',
      /\d/, /\d/, /\d/, '.',
      /\d/, /\d/, /\d/, '/',
      /\d/, /\d/, /\d/, /\d/, '-',
      /\d/, /\d/
    ],
  };

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as unknown as HTMLIonInputElement).getInputElement();

  constructor(private platform: Platform,
    private navCtrl: NavController,
    private modalController: ModalController,
    private apiService: ApiService,
    private uteisService: UteisService) {

    this.platform.ready().then(async () => {

    });
  }

  ngOnInit() {

  }

  async onMudaEtapa() {

    if (this._etapa == 'cnpj') {

      this.modalContaCadastrada.present();

      setTimeout(async () => {
        let _url = '/_bd?c=parceiros'
        _url += "&cnpj=" + this._cnpj;

        await this.apiService.getServer(_url, 2000)
          .then(async (data: any) => {

            this.modalContaCadastrada.dismiss();
            if (data.length == 0) {
              this.uteisService.onToast('Confira o CNPJ novamente, pois não encontramos o seu cadastro.', 4000, 'bottom', 'error');
            } else {
              this._regParceiro = data[0];
              this._etapa = 'chave';
              this.onEnviaChave();
            };
          });
      }, 2000);

    } else {

      let chaveInf = this._chave1 + this._chave2 + this._chave3 + this._chave4
      if (chaveInf != this._chave) {
        this.uteisService.onToast('A Chave informada não confere.', 2000, 'bottom', 'error');
        return;
      };

      this.modalContaCadastrada.present();

      this.uteisService.limparBase('cliente_')
      this.uteisService.salvarBase('parceiro_', [this._regParceiro])
      clearInterval(this.timer);

      setTimeout(() => {
        this.modalContaCadastrada.dismiss();
        this.uteisService.onToast('Suas experiências começam agora!', 2000, 'bottom', 'normal');

        setTimeout(() => {
          this.navCtrl.navigateRoot('/parceiro/tabs/tab1');
          setTimeout(async () => {
            await this.modalController.dismiss();
          }, 200);
        }, 1200);
      }, 4000);

    }

  }

  onEnviaChave() {

    this.timeLeft = 59;
    this.startTimer();

    this._chave = this.uteisService.gerarChave();

    this.uteisService.sendWhats(this._regParceiro.celular, 'Sua chave _Morazzi_ é *' + this._chave + '* 🤩🏠😎🎨').then(() => {
      this.uteisService.onToast('Sua chave de acesso foi enviada para o seu WhatsApp.', 2000, 'bottom', 'normal');
    });

  };

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
