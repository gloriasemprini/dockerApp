import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GroupContainerService {
  private apiUrl = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient) {
  }

  createContainer(groupId: string, imageName: string, portMapping: string): Observable<any> {
    const requestData = {imageName, portMapping, groupId};

    return this.http.post<any>(`${this.apiUrl}/admin/${groupId}/create-container`, requestData).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Gruppo non trovato') {
          console.error('Gruppo non trovato.');
          return throwError('Errore: Gruppo non trovato.');
        } else if (error.status === 500) {
          console.error('Errore interno del server durante la creazione del container.');
          return throwError('Errore interno del server.');
        }
        return throwError(error);
      })
    );
  }

  listContainers(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${groupId}/list-container/`).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Nessun container trovato.') {
          return of([]);
        }
        return throwError(error);
      })
    );
  }

  stopContainer(groupId: string, containerId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${groupId}/stop-container`, {containerId}).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Container non trovato') {
          console.error('Container non trovato.');
          return throwError('Errore: Container non trovato.');
        } else if (error.status === 500) {
          console.error('Errore interno del server durante l\'arresto del container.');
          return throwError('Errore interno del server.');
        }
        return throwError(error);
      })
    );
  }

  startContainer(groupId: string, containerId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${groupId}/start-container`, {containerId}).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Container non trovato') {
          console.error('Container non trovato.');
          return throwError('Errore: Container non trovato.');
        } else if (error.status === 500) {
          console.error('Errore interno del server durante l\'avvio del container.');
          return throwError('Errore interno del server.');
        }
        return throwError(error);
      })
    );
  }

  deleteImage(groupId: string, imageName: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/${groupId}/delete-image`, {
      body: {imageName}
    }).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Immagine non trovata') {
          console.error('Immagine non trovata.');
          return throwError('Errore: Immagine non trovata.');
        } else if (error.status === 500) {
          console.error('Errore interno del server durante l\'eliminazione dell\'immagine.');
          return throwError('Errore interno del server.');
        }
        return throwError(error);
      })
    );
  }

  checkAdmin(groupId: string): Observable<{ isAdmin: boolean }> {
    return this.http.get<{ isAdmin: boolean }>(`${this.apiUrl}/admin/${groupId}/is-admin`).pipe(
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Nessun container trovato.') {
          return of({isAdmin: false});
        }
        return throwError(error);
      })
    );
  }
}
