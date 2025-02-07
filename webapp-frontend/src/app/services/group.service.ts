import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient) {}

  listGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user-groups`).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Nessun gruppo trovato.') {
          return of([]);
        }
        return throwError(error);
      })
    );
  }

  createGroup(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, { name }).pipe(
      catchError((error) => {
        if (error.status === 400 && error.error?.message) {
          return throwError(`Errore nella creazione del gruppo: ${error.error.message}`);
        }
        return throwError('Errore nella creazione del gruppo. Riprova più tardi.');
      })
    );
  }

  getGroupDetails(groupId: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/${groupId}/info`).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Nessun gruppo trovato.') {
          return of([]);
        }
        return throwError(error);
      })
    );
  }

  updateGroupName(groupId: string, groupName: string): Observable<any> {
    return this.http.put<any[]>(`${this.apiUrl}/admin/${groupId}/edit`, { groupId, groupName }).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Nessun gruppo trovato.') {
          return of([]);
        }
        return throwError(error);
      })
    );
  }

  getGroupUsers(groupId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${groupId}/group-users`).pipe(
      catchError((error) => {
        console.error('Errore nel recupero degli utenti del gruppo', error);
        return throwError('Errore nel recupero degli utenti del gruppo');
      })
    );
  }

  addUser(groupId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/${groupId}/inviteUser`, { userId }).pipe(
      catchError((error) => {
        if (error.status === 400 && error.error?.message) {
          return throwError(`Errore: ${error.error.message}`);
        }
        if (error.status === 404) {
          return throwError('Gruppo o utente non trovato.');
        }
        return throwError('Errore generico nell\'aggiunta dell\'utente. Riprova più tardi.');
      })
    );
  }

  removeUser(groupId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/${groupId}/removeUser`, {
      body: { userId }
    }).pipe(
      catchError((error) => {
        if (error.status === 404) {
          console.error('Utente non trovato nel gruppo.');
          return throwError('Errore: Utente non trovato nel gruppo.');
        } else if (error.status === 500) {
          console.error('Errore interno del server nella rimozione dell\'utente.');
          return throwError('Errore interno del server.');
        }
        return throwError(error);
      })
    );
  }

  promoteToAdmin(groupId: string, userId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/${groupId}/change-admin`, { userId }).pipe(
      catchError((error) => {
        console.error('Errore nella promozione dell\'utente a admin', error);
        return throwError('Errore nella promozione dell\'utente a admin');
      })
    );
  }

  getAvailableUsers(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/${groupId}/available-users`).pipe(
      catchError((error) => {
        if (error.status === 404) {
          console.warn('Nessun utente disponibile.');
          return of([]);
        }
        return throwError(error);
      })
    );
  }

  leaveGroup(groupId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/leave`, {
      body: { userId }
    }).pipe(
      catchError((error) => {
        console.error('Errore durante l\'uscita dal gruppo:', error);
        return throwError(() => error);
      })
    );
  }

  adminLeaveGroup(groupId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${groupId}/leave-group`, {
      body: { userId }
    }).pipe(
      catchError((error) => {
        console.error('Errore durante l\'uscita dell\'admin dal gruppo:', error);
        return throwError(() => error);
      })
    );
  }
}
