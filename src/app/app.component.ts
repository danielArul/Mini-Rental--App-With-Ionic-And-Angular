import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private authService:AuthService,
    private router:Router,
    private platform: Platform,

  ) {
    this.initializeApp();
  }

  initializeApp(){
    this.platform.ready().then(()=>{
      if(Capacitor.isPluginAvailable('SplashScreen')){
        SplashScreen.hide();
      }
    })
  }

  onLogout(){
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }
}
