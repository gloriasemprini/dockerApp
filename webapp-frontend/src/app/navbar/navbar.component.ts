import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NotificationComponent} from '../notification/notification.component';
import {AsyncPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [
    NotificationComponent,
    AsyncPipe,
    NgIf,
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']).then(() => {
        console.log('Navigato verso il login');
      });
    });
  }
}
