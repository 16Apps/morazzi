import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { MaskitoModule } from '@maskito/angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    MaskitoModule,
    BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    Device,
    HTTP,
    NativeStorage,
    Camera,
    AndroidPermissions,
    FingerprintAIO,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
