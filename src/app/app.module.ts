import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PublicComponent } from './public/public.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';
import { MenuService } from './services/menu.service';
import { NotificationService } from './services/notification.service';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    PublicComponent,
    LoginComponent
  ],
  declarations: [AppComponent],
  providers: [
    AuthService,
    MenuService,
    NotificationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }