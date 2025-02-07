import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, tap, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink],
})
export class RegistrationComponent {
  firstName = '';
  lastName = '';
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Le password non corrispondono.';
      return;
    }

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      username: this.username,
      password: this.password,
    }).pipe(
      tap(() => {
        alert('Registrazione completata con successo.');
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Errore durante la registrazione.';
        return throwError(error);
      })
    ).subscribe();
  }
}
