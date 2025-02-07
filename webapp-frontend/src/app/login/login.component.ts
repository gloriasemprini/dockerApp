import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink],

})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {
  }

  login() {
    this.authService.login(this.username, this.password).pipe(
      tap(() => {
        void this.router.navigate(['/home']);  // Sopprime il warning
      }),
      catchError((error) => {
        console.error('Errore durante l\'accesso:', error);
        this.errorMessage = 'Credenziali non valide';
        return of(null);
      })
    ).subscribe();
  }
}
