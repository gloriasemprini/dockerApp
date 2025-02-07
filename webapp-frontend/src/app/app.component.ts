import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
  ],
})
export class AppComponent {

  isAuthenticated = false;
  title = 'dockerApp';

  constructor(private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe((status) => {
      this.isAuthenticated = status;
      console.log('Autenticato:', this.isAuthenticated);
    });
  }
}
