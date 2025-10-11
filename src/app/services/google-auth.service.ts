import { Injectable } from '@angular/core';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  constructor() { }

  async loginWithGoogle(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!window.plugins || !window.plugins.googleplus) {
        console.error("Plugin GooglePlus não disponível.");
        reject("Plugin não disponível");
        return;
      }

window.plugins.googleplus.login(
  {
    'webClientId': '780858690347-3r4q2dauucosg2eg137118ue530vjp1n.apps.googleusercontent.com',
    'offline': true,
    'forceCodeForRefreshToken': true,
    'scopes': 'profile email'
  },
  (user: any) => {
    console.log("Login GooglePlus OK:", user);
    alert(JSON.stringify(user, null, 2));
  },
  (err: any) => {
    console.error("Erro no login GooglePlus:", err);
    alert(JSON.stringify(err));
  }
);
    });
  }
}
