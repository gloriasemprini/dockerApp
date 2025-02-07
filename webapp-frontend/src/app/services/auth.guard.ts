import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import {firstValueFrom, lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isAuthenticated = await firstValueFrom(this.authService.isAuthenticated$);

    if (!isAuthenticated) {
      await lastValueFrom(this.authService.logout());
      await this.router.navigate(['/login']);
      return false;
    }

    const isValidToken = await firstValueFrom(this.authService.validateToken());
    if (!isValidToken) {
      await lastValueFrom(this.authService.logout());
      await this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
