import { Component, OnInit, NgZone } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { Router } from '@angular/router';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

import { OrdemPage } from '../ordem/ordem.page';

import * as moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

@Component({
  selector: 'app-servico',
  templateUrl: './servico.page.html',
  styleUrls: ['./servico.page.scss'],
})
export class ServicoPage implements OnInit {

  _colaborador: any = {}
  _ordensLista: any = []
  selectedSegment: string = 'hoje';

  _expositor: any = []
  public html5QrCode: any;
  _scanAtivo: boolean = false;
  _regsVisitantes: any = []
  private scannedCodes = new Set<string>();

  _regVisitante: any = undefined;
  _regEventos: any = [];

  constructor(
    private uteisService: UteisService,
    private apiService: ApiService,
    private platform: Platform,
    private navCtrl: NavController,
    private modalController: ModalController,
    public zone: NgZone,
    private router: Router,
    private androidPermissions: AndroidPermissions,) {


    this.platform.ready().then(async () => {

      this.html5QrCode = new Html5Qrcode("reader");

      this.uteisService.buscarRegistros('expositor').then((res: any) => {

        this._expositor = res[0]
        this._expositor['_logo'] = this.apiService.baseUrl + '/image/' + this._expositor.logo
        this.onPermissoes();
        this.onEventos()
      })

    });

  }

  ngOnInit() {
  }

  onEventos() {

    let url = `/_bd?c=eventos&id_conta=${this._expositor.id_conta._id}&sort=data_hora`
    this.apiService.getServer(url, 2000).then(
      (data: any) => {
        this._regEventos = data
      })

  };

  onPermissoes() {

    const permissionsToRequest = [
      this.androidPermissions.PERMISSION.CAMERA // Adicione a permissão da câmera aqui
    ];

    this.androidPermissions.requestPermissions(permissionsToRequest).then(
      () => {
        // Verifique as permissões individualmente
        Promise.all([
          this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA)
        ]).then(results => {
          const [cameraPermission] = results;

          if (cameraPermission.hasPermission) {
            // As permissões foram concedidas.
            this.onScanLogin();
          } else {
            // Permissões não foram concedidas.
            // Trate o caso em que a permissão não foi concedida
            setTimeout(() => {
              this.onScanLogin();
            }, 2000);
          }
        }).catch(err => {
          alert('1.' + JSON.stringify(err))
          // Ocorreu um erro ao verificar as permissões.
          // this.uteis.presentToast('Tente novamente.', 2000, 'bottom', 'error');
        });
      },
      err => {
        alert('2.' + JSON.stringify(err))
        // Ocorreu um erro ao solicitar as permissões.
        alert("Houve alguma falha, tente novamente.");
      }
    );

  };

  onScanReativar() {

    this._scanAtivo = false;
    this.html5QrCode.stop().then(() => {
      setTimeout(() => {
        this.onScanLogin();
      }, 500);
    })

  };


  onScanLogin() {
    this._scanAtivo = true;

    this.html5QrCode.start(
      { facingMode: "environment" }, // Usa a câmera traseira
      {
        fps: 10, // Frames por segundo
        qrbox: { width: 300, height: 300 } // Dimensões da área de leitura
      },
      (decodedText: string, decodedResult: any) => {
        if (decodedText && !this.scannedCodes.has(decodedText)) {

          // Armazena o código lido recentemente
          this.scannedCodes.add(decodedText);
          this.onGetVisitante(decodedText);

          // this.zone.run(() => {
          //   this._regsVisitantes.push({
          //     "_id": decodedText,
          //   });
          // });

          // Remove o código após 5 segundos para permitir nova leitura
          setTimeout(() => {
            this.scannedCodes.delete(decodedText);
          }, 5000);
        }
      },
      (errorMessage: string) => {
        console.error(`QR Code no match: ${errorMessage}`);
      }
    ).catch((err: any) => {
      console.error(`Unable to start scanning, error: ${err}`);
    });
  }

  onOcultar() {
    return {
      'hidden': this._scanAtivo,
    }
  }


  onGetVisitante(_id: string) {

    this.apiService.getServer('/_bd?c=visitantes&_id=' + _id, 2000).then(
      (data: any) => {

        if (data.length == 0) {

          this.uteisService.onToast('qrCode não credenciado!', 2000, 'bottom', 'error')
          this._regVisitante = 'error'
          setTimeout(() => {
            if (this._regVisitante == 'error') {
              this._regVisitante = undefined
            }
          }, 3000);

        } else {

          this._regVisitante = data[0];
          this._regVisitante['_hora'] = moment().format("HH[h]mm")

          this._regsVisitantes.unshift({
            "_id": this.uteisService.autoID(),
            "nome": this._regVisitante.nome,
            "cidade": this._regVisitante.cidade,
            "estado": this._regVisitante.estado,
            "_dia": moment().utc().format("DD"),
            "_mes": moment().utc().format("MMM"),
            "_hora": moment().format("HH[h]mm")
          });

          this.onRegAcesso();

          this.uteisService.onToast('Visitante registrado!', 2000, 'bottom', 'normal')
          setTimeout(() => {
            if (this._regVisitante != 'error' && this._regVisitante != undefined) {
              this._regVisitante = undefined
            }
          }, 3000);
        };

      },
      (error: any) => {
        this.uteisService.onToast('Verifique sua conexão com a internet.', 2000, 'middle', 'error')
      });
  };

  onRegAcesso() {

      let _regAcesso  = {
        _id: this.uteisService.autoID(),
        id_conta: this._expositor.id_conta._id,
        id_visitante: this._regVisitante._id,
        id_evento: this._regEventos[0]._id,
        resgante_data: moment().format("YYYY-MM-DD HH:mm"),
        status: 'acesso',
        acesso_data: null,
        preco: 0,
        observacoes: null
      }

      this.apiService.pathServer('/_bd/vendas', _regAcesso)
        .then((res) => {
        });
    };


















    onSegmentChanged(event: any) {
      console.log('Segmento selecionado:', this.selectedSegment); // O valor selecionado
      console.log('Evento completo:', event); // Detalhes do evento
      // Adicione sua lógica aqui, dependendo do segmento selecionado
    }





















    onCarregaOrdens() {


      let url = '/_bd?c=servico_registro&id_colaborador=' + this._colaborador._id
      url += '&pop=id_servico_regiao'


      this.apiService.getServer(url, 2000).then(
        (data: any) => {

          if (data.length == 0) {

            this.uteisService.onToast('Ops .. ainda não há Ordens para você.', 2000, 'middle', 'error')

          } else {

            console.log(JSON.stringify(data))
            this.uteisService.salvarBase('ordens', data).then(() => {
              this._ordensLista = data
              for (let i = 0; i < this._ordensLista.length; i++) {
                this._ordensLista[i]['_dataLista'] = formatMonth(moment(this._ordensLista[i].servicos[0].data_servico).utc().format("DDMMM"));
              }
            });

          };

        },
        (error: any) => {
          this.uteisService.onToast('Verifique sua conexão com a internet.', 2000, 'middle', 'error')
        });

      function formatMonth(dateString: string): string {
        // Transforma os três primeiros caracteres do mês para capitalizar a primeira letra
        return dateString.replace(
          /(\d{2})([a-z]{3})/i,
          (_, day, month) => `${day}${month.charAt(0).toUpperCase()}${month.slice(1).toLowerCase()}`
        );
      }
    };


  async onOrdem(reg: any) {

      const modal = await this.modalController
        .create({
          component: OrdemPage,
          componentProps: {
            returnPage: 'home',
            regOrdem: reg
          },
        });

      modal.present();

      modal.onDidDismiss().then(async data => {
        // await this.onListaPedidos();
        // this.onDadosLocais(false);
      });
    };

    onSair() {
      this.router.navigateByUrl('login');
      // this.navCtrl.navigateRoot('login');
    };

  }
