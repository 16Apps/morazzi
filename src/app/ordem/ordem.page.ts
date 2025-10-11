import { Component, OnInit, Input } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';

import * as moment from 'moment';
import 'moment/locale/pt-br'; // Importa o idioma português
moment.locale('pt-br');

@Component({
  selector: 'app-ordem',
  templateUrl: './ordem.page.html',
  styleUrls: ['./ordem.page.scss'],
})
export class OrdemPage implements OnInit {

  @Input() regOrdem: any = [];
  _regStatus: any = [];


  constructor(
    private uteisService: UteisService,
    private apiService: ApiService,
    private platform: Platform,) {

    this.platform.ready().then(async () => {

      this.regOrdem['_dataExt'] = moment(this.regOrdem.registro_data).format('D [de] MMMM [de] YYYY');
      this.regOrdem['_dataOrdemExt'] = moment(this.regOrdem.servicos[0].data_servico).format('D [de] MMMM');

      this.regOrdem['_registro_foto1'] =  '../../assets/image/ordem_foto_servico.fw.png';

      if(this.regOrdem.conf_colaborador_data){
        let _dtConf = moment(this.regOrdem.conf_colaborador_data).format('YYYY-MM-DD')  + ' ' + this.regOrdem.conf_colaborador_hora
        this.regOrdem['_dataConfExt'] = moment(_dtConf).format('D [de] MMMM HH[h]mm');
      }

      if(this.regOrdem.acaminho_data){
        let _dtCaminho = moment(this.regOrdem.acaminho_data).format('YYYY-MM-DD')  + ' ' + this.regOrdem.acaminho_hora
        this.regOrdem['_dataCaminhoExt'] = moment(_dtCaminho).format('D [de] MMMM HH[h]mm');
      }

      if(this.regOrdem.registro_foto1){
        this.regOrdem['_registro_foto1'] = this.apiService.baseUrl + '/image/' + this.regOrdem.registro_foto1
      }

      
      if(this.regOrdem.finalizacao_data){
        let _dtFim= moment(this.regOrdem.finalizacao_data).format('YYYY-MM-DD')  + ' ' + this.regOrdem.finalizacao_hora
        this.regOrdem['_dataFimExt'] = moment(_dtFim).format('D [de] MMMM HH[h]mm');
      }

      
      this.onCarregaStatus();
      // alert(JSON.stringify(this.regOrdem))
    })
  }

  onCarregaStatus() {

    let _url = '/_bd?c=servico_status&id_conta=' + this.regOrdem.id_conta
    this.apiService.getServer(_url, 2000).then(
      (data: any) => {

        this._regStatus = data;

      })

  }

  onConfirmaOrdem(opcao: any) {

    if (opcao == 'sim') {
      this.regOrdem.conf_colaborador_data = moment().format('YYYY-MM-DD');
      this.regOrdem.conf_colaborador_hora = moment().format('HH:mm:ss');

      this.regOrdem['_dataConfExt'] = moment().format('D [de] MMMM HH[h]mm');

      this.uteisService.onToast('Legal contar com você !', 2000, 'middle', 'normal')
    } else {
      this.regOrdem.conf_colaborador_data = moment().format('YYYY-MM-DD');
      this.uteisService.onToast('Sem problemas.', 2000, 'middle', 'normal')
    };

  };

  onConfirmaRota() {

    this.regOrdem.acaminho_data = moment().format('YYYY-MM-DD');
    this.regOrdem.acaminho_hora = moment().format('HH:mm:ss');

    this.regOrdem['_dataCaminhoExt'] = moment().format('D [de] MMMM HH[h]mm');

    let _url = 'https://www.bipzap.com.br/msgWhats/16apps'
    _url += '/' + this.uteisService.formatarNumero(this.regOrdem.cliente_celular)
    _url += '/Olá, ' + this.regOrdem.cliente_nome + '!' + '\n\n'
    _url += 'A Universal Móveis, está passando para informar que sua entrega está a caminho ☺️' + '\n\n'


    this.apiService.getServer(_url, 2000).then(
      (data: any) => {

        this.uteisService.onToast('O cliente já recebeu um Zap!', 2000, 'middle', 'normal');

      })
  };

  onFoto() {

    this.uteisService.onFoto().then((res: any) => {
      this.regOrdem.registro_foto1 = res

      this.regOrdem['_registro_foto1'] = this.apiService.baseUrl + '/image/' + res
    });

  };

  onTrataFoto(foto: string) {
    return this.uteisService.trataFoto(foto)
  };

  onRegistraOrdem() {

    this.regOrdem.finalizacao_data = moment().format('YYYY-MM-DD');
    this.regOrdem.finalizacao_hora = moment().format('HH:mm:ss');

    this.regOrdem['_dataFimExt'] = moment().format('D [de] MMMM HH[h]mm');

    

    this.apiService.pathServer('/_bd/servico_registro', this.regOrdem).then((res) => {
      this.uteisService.onToast('Ordem de Serviço, atualizada com sucesso !', 2000, 'middle', 'normal');
    })

  };


  ngOnInit() {
  }

}
