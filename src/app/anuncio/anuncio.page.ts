import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';

import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import * as moment from 'moment';
moment.locale('pt-br');

@Component({
  selector: 'app-anuncio',
  templateUrl: './anuncio.page.html',
  styleUrls: ['./anuncio.page.scss'],
})

export class AnuncioPage {

  @ViewChild('modalReserva') modalReserva!: IonModal;

  returnPage: string = '';
  _regCliente: any = {};
  _regAtividades: any = [];
  _regInclusos: any = [];
  _regOqueLevar: any = [];
  _regSustentabilidade: any = [];
  _regCancelamento: any = [];
  _regAnuncio: any = {};

  currentIndex = 0;
  touchStartX = 0;
  touchEndX = 0;
  currentStep = 1;

  expandido: boolean = false;
  textoExibido: string = '';

  quantidade = 1;
  _adsQnt = 1
  _adsValor = 0


  _txtBusca: string = "";

  constructor(private apiService: ApiService,
    private uteisService: UteisService,
    private platform: Platform,
    private modalController: ModalController,
    private navParams: NavParams,
    private navCtrl: NavController,) {

    this.platform.ready().then(async () => {
      this.returnPage = this.navParams.get('returnPage');
      this._regCliente = this.navParams.get('_regCliente');
      this._regAtividades = this.navParams.get('_regAtividades');
      this._regInclusos = this.navParams.get('_regInclusos');
      this._regOqueLevar = this.navParams.get('_regOqueLevar');
      this._regSustentabilidade = this.navParams.get('_regSustentabilidade');
      this._regCancelamento = this.navParams.get('_regCancelamento');

      this._regAnuncio = this.navParams.get('_regAnuncio');

      this._regAnuncio.id_parceiro['_membro'] = moment(this._regAnuncio.id_parceiro.criado_em).format("MMMM YYYY")
      this._adsValor = this._regAnuncio.valores[0].valor

      if (this._regAnuncio.inclusos && Array.isArray(this._regAnuncio.inclusos)) {
        this._regAnuncio.inclusos.forEach((incluso: any) => {
          let iFind = this._regInclusos.findIndex((item: any) => item._id == incluso.id_incluso)
          console.log(iFind)
          incluso['_titulo'] = this._regInclusos[iFind].titulo
        });
      };

      if (this._regAnuncio.recomendados && Array.isArray(this._regAnuncio.recomendados)) {
        this._regAnuncio.recomendados.forEach((recomendado: any) => {
          let iFind = this._regOqueLevar.findIndex((item: any) => item._id == recomendado.id_recomendado)
          console.log(iFind)
          recomendado['_titulo'] = this._regOqueLevar[iFind].titulo
        });
      };

      if (this._regAnuncio.sustentabilidades && Array.isArray(this._regAnuncio.sustentabilidades)) {
        this._regAnuncio.sustentabilidades.forEach((sustentabilidade: any) => {
          let iFind = this._regSustentabilidade.findIndex((item: any) => item._id == sustentabilidade.id_sustentabilidade)
          console.log(iFind)
          sustentabilidade['_titulo'] = this._regSustentabilidade[iFind].titulo
        });
      };


    });
  };

  onReservar() {
    this.modalReserva.present()
  }

  ngOnInit() {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this._regAnuncio.fotos.length;
    }, 6000);

    this.atualizarTexto();

  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipeGesture();
  }

  handleSwipeGesture() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) < 30) {
      return; // ignore se arrastar muito pouco
    }

    if (diff > 0) {
      // swipe para a esquerda
      this.nextSlide();
    } else {
      // swipe para a direita
      this.prevSlide();
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this._regAnuncio.fotos.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this._regAnuncio.fotos.length) % this._regAnuncio.fotos.length;
  }

  toggleDescricao() {
    this.expandido = !this.expandido;
    this.atualizarTexto();
  }

  atualizarTexto() {
    const descricao = this._regAnuncio?.descricao || '';
    if (this.expandido) {
      this.textoExibido = descricao; // mostra tudo
    } else {
      const limite = 150; // número de caracteres que você quer exibir inicialmente
      this.textoExibido = descricao.length > limite
        ? descricao.substring(0, limite) + '...'
        : descricao;
    }
  }

  onQntValores(acao: string) {

    if (acao == '+') {
      this._adsQnt++
    } else {
      this._adsQnt--
      if (this._adsQnt == 0) {
        this._adsQnt++
      }
    }

    if (this._adsQnt <= 4) {
      let iFind = this._regAnuncio.valores.findIndex((item: any) => item.qnt_pessoas == this._adsQnt)
      if (iFind != -1) {
        this._adsValor = this._regAnuncio.valores[iFind].valor
      }
    } else if (this._adsQnt > 4 && this._adsQnt < 10) {
      let iFind = this._regAnuncio.valores.findIndex((item: any) => item.qnt_pessoas == 5)
      if (iFind != -1) {
        this._adsValor = this._regAnuncio.valores[iFind].valor
      }
    } else if (this._adsQnt > 10) {
      let iFind = this._regAnuncio.valores.findIndex((item: any) => item.qnt_pessoas == 11)
      if (iFind != -1) {
        this._adsValor = this._regAnuncio.valores[iFind].valor
      }
    }

  }

  aumentar() {
    this.quantidade++;
  }

  diminuir() {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }

  onBuscaPasseios(event: any) {
    this.fecharModal();
    this.navCtrl.navigateRoot('/tabs/tab2', {
      queryParams: { valor: this._txtBusca }
    });

  }

  async fecharModal() {
    await this.modalController.dismiss();
  }




}
