import { Component, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Platform, ModalController } from '@ionic/angular';

import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { IonDatetime } from '@ionic/angular/standalone';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-agendar',
  templateUrl: './agendar.page.html',
  styleUrls: ['./agendar.page.scss'],
})
export class AgendarPage {


  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @ViewChild('modalData') modalData!: IonModal;
  @ViewChild('modalRegistro') modalRegistro!: IonModal;



  returnPage: string = '';
  _regVeiculosMotorista: any = {};

  _modoReg: any = "datas"
  _data_agendamento_inicial: any = moment().add(7, 'days').format("YYYY-MM-DD")
  _data_agendamento_final: any = moment().add(14, 'days').format("YYYY-MM-DD")


  // highlightedDates = [
  //   {
  //     date: '2023-01-05',
  //     textColor: '#800080',
  //     backgroundColor: '#ffc0cb',
  //   },
  //   {
  //     date: '2023-01-10',
  //     textColor: '#09721b',
  //     backgroundColor: '#c8e5d0',
  //   },
  //   {
  //     date: '2023-01-20',
  //     textColor: 'var(--ion-color-secondary-contrast)',
  //     backgroundColor: 'var(--ion-color-secondary)',
  //   },
  //   {
  //     date: '2023-01-23',
  //     textColor: 'rgb(68, 10, 184)',
  //     backgroundColor: 'rgb(211, 200, 229)',
  //   },
  // ];

  primeiraData?: string;
  ultimaData?: string;
  selectedDate?: string;
  minDate?: string;
  maxDate?: string;
  highlightedDates: { date: string, textColor: string, backgroundColor: string }[] = [];


  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private navParams: NavParams) {

    this.platform.ready().then(async () => {

      this.returnPage = this.navParams.get('returnPage');
      this._regVeiculosMotorista = this.navParams.get('_regVeiculosMotorista');

      this.selectedDate = moment().add(4, 'days').format('YYYY-MM-DD');
      this.destacarPeriodo({ detail: { value: this.selectedDate } });


    });

  };


  destacarPeriodo(event: any) {
    const selected = event.detail.value; // 'YYYY-MM-DD'
    if (!selected) {
      this.highlightedDates = [];
      return;
    }


    const center = moment(selected);
    this.minDate = center.clone().subtract(2, 'days').format('YYYY-MM-DDT00:00:00');
    this.maxDate = center.clone().add(21, 'days').format('YYYY-MM-DDT23:59:59');

    this.highlightedDates = [];

    this.primeiraData = center.clone().add(-2, 'days').format('YYYY-MM-DD');
    this.ultimaData = center.clone().add(2, 'days').format('YYYY-MM-DD');

    for (let i = -2; i <= 2; i++) {
      const day = center.clone().add(i, 'days').format('YYYY-MM-DD');
      this.highlightedDates.push({
        date: day,
        textColor: '#ffffff',           // texto preto
        backgroundColor: '#1e6091'
      });
    }
  }


  onRegistraServico() {

    this.modalRegistro.present();


    setTimeout(() => {

      this._regVeiculosMotorista.servico.data_agendamento_inicial = moment(this.primeiraData).format('YYYY-MM-DD')
      this._regVeiculosMotorista.servico.data_agendamento_final = moment(this.ultimaData).format('YYYY-MM-DD')

      setTimeout(() => {
        this.modalRegistro.dismiss();


        setTimeout(() => {
          this.modalData.dismiss()
          setTimeout(() => {
            this.fecharModal()

            setTimeout(() => {
              this.fecharModal()
            }, 500)

          }, 500)
        }, 500)





      }, 1000)
    }, 4000);


    this._modoReg = 'registrando'


    // setTimeout(() => {
    //   this._modoReg = 'check'

    //   setTimeout(() => {
    //     this.fecharModal();

    //     setTimeout(() => {
    //       this.fecharModal()
    //     }, 500);

    //   }, 3000);
    // }, 3000);
  }

  onAbrirDatas() {
    this.modalData.present();
  }

  atualizarData(event: any) {
    this._regVeiculosMotorista.servico.data_agendamento_inicial = event.detail.value;
  }

  ngOnInit() {
  }

  async fecharModal() {
    await this.modalController.dismiss(this._regVeiculosMotorista);
  }

  formataData(data: any) {
    return moment(data).format("DDMMM")
  }



}
