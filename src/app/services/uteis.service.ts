import { Injectable } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class UteisService {

  private loading: any

  constructor(
    private apiService: ApiService,
    private nativeStorage: NativeStorage,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private camera: Camera) {

  };

  async onLoading(msg: string, timer: number) {
    this.loading = await this.loadingCtrl.create({
      message: msg,
      duration: timer,
      cssClass: 'custom-loading',
      mode: 'ios',
      animated: true
    });

    this.loading.present();
  };

  async onHideLoading() {
    await this.loading.dismiss();
  };

  async onToast(msg: string, timer: number, position: 'top' | 'middle' | 'bottom', status: 'normal' | 'error') {
    const toast = await this.toastController.create({
      message: msg,
      duration: timer,
      position: position,
      cssClass: status == 'normal' ? 'custom-toast' : 'custom-toast-error',
      mode: 'ios',
      animated: true
    });

    await toast.present();
  };

  async onAlert(title: string, sub: string, msg: string) {
    const alert = await this.alertController.create({
      header: title,
      subHeader: sub,
      message: msg,
      buttons: ['OK'],
      cssClass: 'custom-loading',
      mode: 'ios',
    });

    await alert.present();
  };

  async questionAlert(title: string, sub: string, msg: string, txtBtn1: string, txtBtn2: string): Promise<string> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: title,
        subHeader: sub,
        message: msg,
        buttons: [
          {
            text: txtBtn1,
            cssClass: 'alert-button-cancel',
            handler: () => {
              resolve('btn1');
            }
          },
          {
            text: txtBtn2,
            cssClass: 'alert-button-confirm',
            handler: () => {
              resolve('btn2');
            }
          }
        ],
        cssClass: 'custom-loading',
        mode: 'ios',
      });

      await alert.present();
    });
  };

  autoID() {
    return 'xxxxxxxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  salvarBase(baseDeDados: string, registros: any) {

    return new Promise((resolve, reject) => {
      this.nativeStorage.setItem(baseDeDados, registros)
        .then(() => resolve(registros))
        .catch(error => reject(error));
    });

  };

  salvarRegistro(baseDeDados: string, registro: any) {
    return new Promise((resolve, reject) => {
      this.nativeStorage.getItem(baseDeDados)
        .then((registros: any[]) => {
          if (registros) {

            const index = registros.findIndex(item => item._id === registro._id);

            if (index !== -1) {
              registros[index] = registro;
            } else {
              registros.push(registro);
            }

            this.nativeStorage.setItem(baseDeDados, registros)
              .then(() => resolve(registros))
              .catch(error => reject(error));
          } else {
            this.nativeStorage.setItem(baseDeDados, [registro])
              .then(() => resolve([registro]))
              .catch(error => reject(error));
          };
        })
        .catch(error => {
          this.nativeStorage.setItem(baseDeDados, [registro])
          resolve(registro)
          console.error('Erro ao buscar base de dados: ', error)
        });
    })
  };

  buscarRegistros(baseDeDados: string) {
    return new Promise((resolve, reject) => {
      this.nativeStorage.getItem(baseDeDados)
        .then((registros: any[]) => {
          if (registros) {
            resolve(registros);
          } else {
            resolve([]);
          }
        })
        .catch((error: any) => resolve([]));
    });
  };

  buscarRegistro(id: string, baseDeDados: string) {
    return new Promise((resolve, reject) => {
      this.nativeStorage.getItem(baseDeDados)
        .then((registros: any[]) => {
          if (registros) {
            const registro = registros.find(item => item._id === id);

            if (registro) {
              resolve(registro);
            } else {
              resolve([]);
            }
          } else {
            resolve([]);
          };
        })
        .catch(error => reject(error));
    })


  };

  removerRegistro(id: number, baseDeDados: string) {
    this.nativeStorage.getItem(baseDeDados)
      .then((registros: any[]) => {
        if (registros) {
          const index = registros.findIndex(item => item._id === id);

          if (index !== -1) {
            registros.splice(index, 1);

            // Salva os registros atualizados
            this.nativeStorage.setItem(baseDeDados, registros)
              .then(() => Promise.resolve(registros))
              .catch(error => Promise.reject(error));
          }
        }
      })
      .catch(error => Promise.reject(error));
  };

  async limparBase(baseDeDados: string): Promise<void> {
    try {
      await this.nativeStorage.remove(baseDeDados);
      console.log('Base de dados limpa com sucesso.');
    } catch (error) {
      console.error('Erro ao limpar a base de dados:', error);
      throw error;
    }
  }

  limparFull() {
    return new Promise((resolve, reject) => {
      this.nativeStorage.clear()
        .then(() => resolve('limpo'))
        .catch(error => reject(error));
    });
  }

  sendWhats(celular: string, msg: string) {

    return new Promise((resolve, reject) => {
      let url = 'https://bipzap.herokuapp.com/msgWhats/16apps/' + this.formatarNumero(celular) + '/'
      url += msg

      this.apiService.getServer(url, 3000)
        .then((res: any) => {
          resolve({ retorno: 'sendo' })
        })
        .catch(error => reject({ retorno: error }));
    })

  }

  formatarNumero(numeroCompleto: any) {

    let ddd = parseInt(numeroCompleto.substring(1, 3));

    if (ddd <= 27) {
      return '55' + ddd + numeroCompleto.replace(/\D/g, '').replace('-', '');
    } else if (ddd >= 28 && ddd <= 99) {
      return '55' + ddd + numeroCompleto.replace(/^\(\d{2}\)\s*/, '').replace(/\D/g, '').substring(1).replace('-', ''); // Remove (XX) e espaços, deixando apenas os 10 dígitos
    } else {
      return 'Formato de DDD inválido';
    }
  };


  gerarChave() {
    const chave = Math.floor(1000 + Math.random() * 9000); // Gera um número aleatório de 1000 a 9999
    return chave.toString(); // Converte o número para string
  };

  onFoto() {

    return new Promise(async (resolve) => {

      this.questionAlert('Atenção !\n', 'De onde virá a imagem ?', "", 'Galeria', 'Camera').then((botaoClicado) => {

        let sourceType = 0;
        if (botaoClicado == 'btn2') {
          sourceType = 1;
        };

        const options: CameraOptions = {
          quality: 70, // Ajuste a qualidade para um valor entre 0 e 100
          targetWidth: 700, // Defina a largura da imagem desejada
          targetHeight: 700, // Defina a altura da imagem desejada
          correctOrientation: true,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
          sourceType: sourceType,
          allowEdit: false
        };


        this.camera.getPicture(options).then((imageData) => {

          let reg: any = [];
          reg.push({
            foto: imageData //'data:image/jpeg;base64,' + imageData
          })

          this.apiService.postServer('/save', reg).then((res: any) => {
            res = JSON.parse(res)
            resolve(res[0].id_foto)
          });

        }, (err) => {
          alert(JSON.stringify(err))
        });

      })
    })
  };

  trataFoto(foto: string, padrao?: string) {

    if (!foto) {
      return '../assets/img/icons/' + padrao
    } else if (foto.includes('http')) {
      return foto
    } else if (foto.includes('data:image')) {
      return foto
    } else {
      return this.apiService.baseUrl + '/image/get/' + foto
    }

  }



  separarNomeSobrenome(nomeCompleto: string) {
    // Remove espaços em branco extras no início e no final da string
    nomeCompleto = nomeCompleto.trim();

    // Divide a string em um array de palavras
    const palavras = nomeCompleto.split(' ');

    // Se houver apenas uma palavra, ela é o primeiro nome
    if (palavras.length === 1) {
      return {
        primeiroNome: palavras[0],
        sobrenome: ''
      };
    }

    // A primeira palavra é o primeiro nome
    const primeiroNome = palavras[0];

    // As palavras restantes são o sobrenome
    const sobrenome = palavras.slice(1).join(' ');

    return {
      primeiroNome: primeiroNome,
      sobrenome: sobrenome
    };
  };

  moedaBR(i: any) {
    var decimais = 2;
    var separador_milhar = '.';
    var separador_decimal = ',';

    var decimais_ele = Math.pow(10, decimais);
    var thousand_separator = '$1' + separador_milhar;
    var v = i.target.value.replace(/\D/g, '');
    v = (v / decimais_ele).toFixed(decimais) + '';
    var splits = v.split(".");
    var p_parte = splits[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, thousand_separator);
    (typeof splits[1] === "undefined") ? i.target.value = p_parte : i.target.value = p_parte + separador_decimal + splits[1];
  };

  desformataMoedaBR(valor: string): number {
    if (!valor) return 0;
    valor = valor.replace(/\./g, "");   // remove milhares
    valor = valor.replace(",", ".");    // vírgula vira ponto
    return parseFloat(valor);
  }


  moedaBR2(event: any) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    // Remove tudo que não for dígito
    valor = valor.replace(/\D/g, '');

    // Se nada foi digitado, limpa
    if (!valor) {
      input.value = '';
      return;
    }

    // Converte para número com dois decimais (centavos)
    const numero = parseFloat(valor) / 100;

    // Formata para padrão brasileiro (pt-BR)
    input.value = numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

}
