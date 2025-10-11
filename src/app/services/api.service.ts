import { Injectable } from '@angular/core';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';


@Injectable({
  providedIn: 'root',
})
export class ApiService {


  // public baseUrl = 'http://192.168.70.243:5000'; 
  public baseUrl = 'http://192.168.0.24:3001'; 
  // public baseUrl = 'https://itour-53fabe9a3dca.herokuapp.com';

  constructor(private http: HTTP) { }

  getServer(url: string, timer: number) {

    timer = timer * 2
    let returnTime = false;

    return new Promise((resolve, reject) => {

      if (!url.includes('http')) {
        url = this.baseUrl + url
      };

      console.log(url)

      this.http.sendRequest(url, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
        serializer: 'utf8'
      }).then(data => {
        returnTime = true;
        resolve(JSON.parse(data.data));
      }).catch(error => {
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

  postServer(url: string, dataJson: any) {

    return new Promise((resolve, reject) => {

      dataJson = JSON.stringify(dataJson)

      this.http.sendRequest(this.baseUrl + url, {
        method: 'post',
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
