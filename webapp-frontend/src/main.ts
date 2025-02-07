import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { FormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, provideHttpClient} from '@angular/common/http';
import { AppRoutingModule } from './app/app-routing.module';
import { AppModule } from './app/profile/profile.module';
import {TokenInterceptorService} from './app/services/token-interceptor.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(FormsModule, AppRoutingModule, AppModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
