import { Injectable } from '@angular/core';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  public baseUrl = 'https://sua-api-url.com'; // Substitua pela URL base da sua API

  constructor(private http: HTTP) {}

  // Cabeçalhos genéricos (se necessário)
  getServer(url: string, timer: number) {

    timer = timer * 2
    let returnTime = false;

    return new Promise((resolve, reject) => {

      if(url.includes('http') == false){
        url = this.baseUrl + url
      }

      this.http.sendRequest( url, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
        serializer: 'utf8'
      }).then(data => {
        returnTime = true;
        resolve(JSON.parse(data.data));
      })
        .catch(error => {
          returnTime = true;
          reject(error.error)
          console.log(error.status + '|' + error.data + '|' + error.headers);
        });

    });
  };

  pathServer(url: string, dataJson: any) {

    return new Promise((resolve, reject) => {

      dataJson = JSON.stringify(dataJson)

      this.http.sendRequest(this.baseUrl + url, {
        method: 'patch',
        headers: {
          'Content-Type': 'application/json'
        },
        serializer: 'utf8',
        // @ts-ignore
        data: dataJson

      }).then(data => {
        resolve(data.data);
        console.log(data.status + '|' + data.data + '|' + data.headers);
      })
        .catch(error => {
          reject(error.error)
          console.log(error.status + '|' + error.data + '|' + error.headers);
        });

    });
  };
}
