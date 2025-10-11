import { Component, OnInit, NgZone } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { UteisService } from '../services/uteis.service';
import { Router } from '@angular/router';

import * as moment from 'moment';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-rodizio',
  templateUrl: './rodizio.page.html',
  styleUrls: ['./rodizio.page.scss'],
})
export class RodizioPage implements OnInit {

  _ponto: any = {}
  _colaboradores: any = []
  _colaboradoresFila: any = []
  _colaboradorFila: any = {
    _id: '',
    foto: '../../assets/image/avatar.png',
    nome: 'Aguardando ...',
    hora_entrada: '00:00:00',
    hora_saida: '00:00:00',
    hora_atendimento_entrada: '00:00:00',
    hora_atendimento_saida: '00:00:00',
    qnt: 0,
    status: 'presenca'
  }

  private clockInterval: any;

  constructor(
    private uteisService: UteisService,
    private apiService: ApiService,
    private platform: Platform,
    private navCtrl: NavController,
    public zone: NgZone,
    private router: Router,) {


    this.platform.ready().then(async () => {
      this.uteisService.buscarRegistros('ponto').then(async (res: any) => {

        this._ponto = res[0]

        await this.uteisService.buscarRegistros('_colaboradores').then(async (res: any) => {
          this._colaboradores = res;
          this._colaboradoresFila = res;

          let dtCorrente = moment().format('YYYY-MM-DD')
          if(res.length > 0){
            if(res[0].registro.status_data.toString().includes(dtCorrente.toString())==false){
              this._colaboradores = [];
              this._colaboradoresFila = [];
            };
          }

          this.onSyncColaboradores();

        });
        

        // await this.uteisService.buscarRegistros('_colaboradores').then(async (res: any) => {

        //   this._colaboradores = res;
        //   alert(res.length)
  
        //   await this.uteisService.buscarRegistros('_colaboradoresFila').then((res: any) => {

        //     this._colaboradoresFila = res;
        //     this.onSyncColaboradores();

        //   })
        // })

      })
    });

  };

  ngOnInit() {
  }

  onSyncColaboradores() {

    let _url = '/_bd?c=colaborador_servico&id_loja=' + this._ponto.id_loja
    _url += '&pop=id_colaborador'

    this.apiService.getServer(_url, 2000).then(
      (data: any) => {

      
        for (let i = 0; i < data.length; i++) {

          let iFind = this._colaboradores.findIndex((item: any) => item._id == data[i].id_colaborador._id)

          if (iFind == -1) {

            data[i].id_colaborador['_foto'] = this.apiService.baseUrl + '/image/' + data[i].id_colaborador.foto
            data[i].id_colaborador['_hora_fila'] = "00:00"

            data[i].id_colaborador['_qnt'] = 0

            data[i].id_colaborador['_fila'] = 0
            data[i].id_colaborador['_posicao'] = 0
            data[i].id_colaborador['_presenca'] = -1

            let _temp = this.onRegRodizio({
              id_vendedor: data[i].id_colaborador._id,
              status: 'ausente'
            })
            data[i].id_colaborador['registro'] = _temp

            this._colaboradores.push(
              data[i].id_colaborador
            );

            

            this._colaboradoresFila = JSON.parse(JSON.stringify(this._colaboradores))
            
            console.log(JSON.stringify(this._colaboradores))
          };

          if(i+1== data.length){
            this.onOrdenaLista()
          }
          

        };

      },
      (error: any) => {
        this.uteisService.onToast('Verifique sua conexão com a internet.', 2000, 'middle', 'error')
      });

  };


  async onPresenca(reg: any, slidingItem: any) {

    // const maiorPosicao = this._colaboradoresFila.reduce((max: any, item: any) => Math.max(max, item._posicao), 0);

    if (reg.registro.status == 'ausente') {
      reg._presenca = 1;
      this.uteisService.onToast('Oba ! Você está presente.', 2000, 'bottom', 'normal')

    } else {
      reg._presenca = 0;
      this.uteisService.onToast('Até logo !', 2000, 'bottom', 'normal')
    };

    let _temp = this.onRegRodizio({
      id_vendedor: reg._id,
      status: reg._presenca == 1 ? 'fila' : 'ausente'
    })
    reg.registro = _temp

    let _regPresenca = JSON.parse(JSON.stringify(reg.registro))
    _regPresenca.status = reg._presenca == 1 ? 'presente' : 'ausente'
    this.apiService.pathServer('/_bd/rodizio_registro', _regPresenca)

    this.onRegraOrdenacao();
    await this.onRegraOrdenacao();
    setTimeout(() => {
      if (this._colaboradoresFila[0]._fila == 0 && this._colaboradoresFila[0].registro.status == 'fila') {
        this.onPosicao(this._colaboradoresFila[0], undefined)
      };
    }, 1000);

    slidingItem.close();

  };

  async onEntrarAtendimentoLista(reg: any, slidingItem: any) {
    this.onEntrarAtendimento(reg)
    slidingItem.close();
  }


  async onEntrarAtendimento(reg: any) {

    const maiorPosicao = this._colaboradoresFila.reduce((max: any, item: any) => Math.max(max, item._posicao), 0);

    reg._fila = 0;
    reg._posicao = maiorPosicao + 1;
    reg.registro.status = 'atendimento';
    reg.registro.atendimento_entrada_data = moment().format('YYYY-MM-DD HH:mm:ss');

    await this.onRegraOrdenacao();
    setTimeout(() => {
      if (this._colaboradoresFila[0]._fila == 0 && this._colaboradoresFila[0].registro.status == 'fila') {
        this.onPosicao(this._colaboradoresFila[0], undefined)
      };
    }, 1000);

  };

  async onFinalizaAtendimento(reg: any, slidingItem: any) {

    reg.registro.atendimento_saida_data = moment().format('YYYY-MM-DD HH:mm:ss');
    this.apiService.pathServer('/_bd/rodizio_registro', reg.registro)

    reg._fila = 0;
    let _temp = this.onRegRodizio({
      id_vendedor: reg._id,
      status: 'fila'
    })
    reg.registro = _temp;

    await this.onRegraOrdenacao();
    setTimeout(() => {
      if (this._colaboradoresFila[0]._fila == 0 && this._colaboradoresFila[0].registro.status == 'fila') {
        this.onPosicao(this._colaboradoresFila[0], undefined)
      };
    }, 1000);

    slidingItem.close();

  };

  async onCancelaFila(reg: any) {

    reg._presenca = 0;
    reg._fila = 0;
    let _temp = this.onRegRodizio({
      id_vendedor: reg._id,
      status: 'ausente'
    })
    reg.registro = _temp
    this.apiService.pathServer('/_bd/rodizio_registro', reg.registro)

    await this.onRegraOrdenacao();
    setTimeout(() => {
      if (this._colaboradoresFila[0]._fila == 0 && this._colaboradoresFila[0].registro.status == 'fila') {
        this.onPosicao(this._colaboradoresFila[0], undefined)
      };
    }, 1000);

  };

  onPosicao(reg: any, slidingItem: any) {

    let iFind = this._colaboradoresFila.findIndex((item: any) => item._id == reg._id)
    const maiorPosicao = this._colaboradoresFila.reduce((max: any, item: any) => Math.max(max, item._posicao), 0);

    if (iFind == 0 || (iFind == 1 && this._colaboradoresFila[0]._fila == 1)) {

      this._colaboradoresFila[0]._fila = 0;
      this._colaboradoresFila[0]._posicao = maiorPosicao + 1;
      this._colaboradoresFila[0].registro.status = 'atendimento';
      this._colaboradoresFila[0].registro.atendimento_entrada_data = moment().format('YYYY-MM-DD HH:mm:ss');

      reg._fila = 1;
      reg._posicao = 0;
      reg._qnt = reg._qnt + 1
      reg.hora_saida = '00:00:00';

      reg.registro.status = 'fila';
      let _temp = this.onRegRodizio({
        id_vendedor: reg._id,
        status: 'fila',
        entrada_data: moment().format('YYYY-MM-DD HH:mm:ss'),
        atendimento_numero_dia: reg._qnt
      })
      reg.registro = _temp

      clearInterval(this.clockInterval);

      this.clockInterval = setInterval(() => {

        reg.registro.saida_data = moment().format('YYYY-MM-DD HH:mm:ss');

        let agora = moment();
        let horaEntradaMoment = moment(reg.registro.entrada_data, 'YYYY-MM-DD HH:mm:ss');
        let duracao = moment.duration(agora.diff(horaEntradaMoment));

        let tempoDecorrido = `${Math.floor(duracao.asHours())
          .toString()
          .padStart(2, '0')}:${duracao.minutes().toString().padStart(2, '0')}:${duracao.seconds().toString().padStart(2, '0')}`;
        reg.hora_saida = tempoDecorrido;
      }, 1000);


    } else {

      let posicaoSuperior = this._colaboradoresFila[iFind - 1]._posicao;
      let posicaoInferior = this._colaboradoresFila[iFind]._posicao;
      this._colaboradoresFila[iFind - 1]._posicao = posicaoInferior;
      this._colaboradoresFila[iFind]._posicao = posicaoSuperior;

    };

    this.onOrdenaLista();
    slidingItem.close();

  };

  onPosicaoBaixar(reg: any, slidingItem: any) {

    let iFind = this._colaboradoresFila.findIndex((item: any) => item._id == reg._id)

    if (iFind + 1 == this._colaboradoresFila.length) {
      slidingItem.close();
      return;
    };

    let posicaoSuperior = this._colaboradoresFila[iFind]._posicao;
    let posicaoInferior = this._colaboradoresFila[iFind + 1]._posicao;

    // Troca as posições
    this._colaboradoresFila[iFind]._posicao = posicaoInferior;
    this._colaboradoresFila[iFind + 1]._posicao = posicaoSuperior;

    this.onOrdenaLista();
    slidingItem.close();
  };

  onRegRodizio(reg: any) {

    let _reg = {
      _id: this.uteisService.autoID(),
      id_conta: this._ponto.id_conta,
      id_loja: this._ponto.id_loja,
      id_vendedor: reg.id_vendedor,
      status: reg.status ? reg.status : 'ausente',
      status_data: reg.status ? moment().format('YYYY-MM-DD HH:mm:ss') : '',
      entrada_data: reg.entrada_data ? moment().format('YYYY-MM-DD HH:mm:ss') : '',
      saida_data: reg.saida_data ? moment().format('YYYY-MM-DD HH:mm:ss') : '',
      atendimento_entrada_data: reg.atendimento_entrada_data ? moment().format('YYYY-MM-DD HH:mm:ss') : '',
      atendimento_saida_data: reg.atendimento_saida_data ? moment().format('YYYY-MM-DD HH:mm:ss') : '',
      atendimento_numero_dia: reg.atendimento_numero_dia ? reg.atendimento_numero_dia : 0,
    }

    return _reg

  };

  async onRegraOrdenacao() {

    let posicao = 0;

    for (let i = 0; i < this._colaboradoresFila.length; i++) {
      if (this._colaboradoresFila[i]._fila == 0) {
        if (this._colaboradoresFila[i].registro.status == 'fila') {
          posicao = posicao + 1
          this._colaboradoresFila[i]._posicao = posicao
        }
      }
    }

    for (let i = 0; i < this._colaboradoresFila.length; i++) {
      if (this._colaboradoresFila[i]._fila == 0) {
        if (this._colaboradoresFila[i].registro.status == 'atendimento') {
          posicao = posicao + 1
          this._colaboradoresFila[i]._posicao = posicao
        }
      }
    }

    for (let i = 0; i < this._colaboradoresFila.length; i++) {
      if (this._colaboradoresFila[i]._fila == 0) {
        if (this._colaboradoresFila[i].registro.status == 'ausente') {
          posicao = posicao + 1
          this._colaboradoresFila[i]._posicao = posicao
        }
      }
    }

    this.onOrdenaLista();

  };

  onOrdenaLista() {

    this._colaboradoresFila.sort(function (a: any, b: any) {

      if (b._fila !== a._fila) {
        return b._fila - a._fila;
      }

      if (b._presenca !== a._presenca) {
        return b._presenca - a._presenca;
      }

      return a._posicao - b._posicao;
    });

    for(let i=0;i < this._colaboradoresFila.length;i++){
      let _nome = this._colaboradoresFila[i].nome.split(' ')
      this._colaboradoresFila[i]['nome_curto'] = _nome[0]
      if(_nome.length >= 1){
        this._colaboradoresFila[i]['nome_curto'] += ' ' + _nome[_nome.length - 1]
      }
    }

    this.uteisService.salvarBase('_colaboradores', this._colaboradoresFila)
    this.uteisService.salvarBase('_colaboradoresFila', this._colaboradoresFila)

  };



  onSair() {
    // this.router.navigateByUrl('login');

    this.uteisService.limparBase('ponto');
    this.uteisService.limparBase('_colaboradores');
    this.uteisService.limparBase('_colaboradoresFila');

    this.navCtrl.navigateRoot('login');
  }

}
