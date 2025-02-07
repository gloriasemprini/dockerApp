import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {BehaviorSubject, from, map, Observable, of, tap, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());

  constructor(private router: Router, private http: HttpClient) {}

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  checkAuthentication(): boolean {
    return !!localStorage.getItem('token') && !!localStorage.getItem('userId');
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user, {
      headers: {
        skipTokenInterceptor: 'true',
      }
    })
      .pipe(
        tap(() => {
          alert('Registrazione completata con successo.');
          from(this.router.navigate(['/login']));
        }),
        catchError(this.handleError)
      );
  }

  login(username: string, password: string): Observable<any> {
    const credentials = { username, password };
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, {
      headers: {
        skipTokenInterceptor: 'true',
      }
    }).pipe(
        tap((res) => {
          if (res && res.token && res.userId) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('userId', res.userId);
            this.isAuthenticatedSubject.next(true);
          } else {
            throw new Error('Errore nel recupero del token o dell\'ID utente.');
          }
        }),
        catchError((error) => {
          console.error('Errore durante l\'accesso:', error);
          return throwError(error);
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearLocalStorage();
        this.isAuthenticatedSubject.next(false); // aggiorna il flusso di autenticazione
      }),
      catchError((error) => {
        console.error('Errore durante il logout:', error);
        return of(undefined);
      })
    );
  }

  // Clear localStorage
  private clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  validateToken(): Observable<boolean> {
    return this.http.post<{ message: string } | boolean>(`${this.apiUrl}/validate-token`, {}).pipe(
      map((response) => response === true || (typeof response === 'object' && response.message === 'Token valido')),
      catchError(() => of(false))
    );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      alert('Credenziali non valide. Riprova.');
    } else {
      alert('Errore durante l\'operazione. Riprova più tardi.');
    }
    return throwError(error);
  }
}
