import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavController, ModalController, IonModal } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { UteisService } from '../../services/uteis.service';
import { ActivatedRoute } from '@angular/router';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})

export class Tab2Page {

  @ViewChild('modalRegistroVenda') modalRegistroVenda!: IonModal;

  _regParceiro: any = undefined;
  _regLeads: any = [];

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

      this.onCarregaLeads();

    })
  }

  ngOnInit() {
  }

  onCarregaLeads() {

    this.uteisService.buscarRegistros('leads_').then((data: any) => {

      if (data.length > 0) {
        this._regLeads = data

          let totalGeral = 0;
          let totalMes = 0;

          const mesAtual = new Date().getMonth();
          const anoAtual = new Date().getFullYear();

          for (let venda of this._regLeads) {
            // Soma geral
            totalGeral += 1;

            // Soma apenas vendas do mês atual
            const dt = new Date(venda.editado_em);
            if (dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual) {
              totalMes += 1;
            }
          }

          // Agora formata para BR
          this.acumuladoGeral = totalGeral;
          this.acumuladoMes = totalMes;
        
      }
    })
  }

  onFormataAcao(acao: string) {

    if (acao == 'clique_whats') {
      return "Contato Whats"
    } else if (acao == 'clique_site') {
      return "Acesso Site"
    } else if (acao == 'clique_social') {
      return "Rede Social"
    } else if (acao == 'clique_celular') {
      return "Ligação"
    } else if (acao == 'indicacao_bot') {
      return "Indicação"
    } else {
      return acao
    }
  }


  onFormataData(_date: any) {

    return moment(_date).format("DDMMMYY HH[h]mm")

  }






}
