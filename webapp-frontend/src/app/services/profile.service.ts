import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<any> {
    console.log(userId);
    return this.http.get(`${this.apiUrl}/${userId}/profile`).pipe(
      catchError((error) => {
        if (error.status === 404) {
          console.error('Profilo non trovato');
          return of(null);
        }
        return throwError(error);
      })
    );
  }

  updateNameSurname(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/profile/update-name-surname`, data).pipe(
      catchError((error) => {
        console.error('Errore durante l\'aggiornamento del nome e cognome:', error);
        return throwError(error);
      })
    );
  }

  updateUsername(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/profile/update-username`, data).pipe(
      catchError((error) => {
        console.error('Errore durante l\'aggiornamento dello username:', error);
        return throwError(error);
      })
    );
  }

  updateEmail(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/profile/update-email`, data).pipe(
      catchError((error) => {
        console.error('Errore durante l\'aggiornamento dell\'email:', error);
        return throwError(error);
      })
    );
  }

  changePassword(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/profile/change-password`, data).pipe(
      catchError((error) => {
        console.error('Errore durante il cambio della password:', error);
        return throwError(error);
      })
    );
  }

  deleteProfile(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/profile/deleteAccount`).pipe(
      catchError((error) => {
        console.error('Errore durante l\'eliminazione del profilo:', error);
        return throwError(error);
      })
    );
  }
}
