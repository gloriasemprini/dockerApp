import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private notificationsSubject = new Subject<any>();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  connect() {
    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.onopen = () => {
      console.log('Connesso al WebSocket');
      console.log('sono qui');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message + 'messaggio socket');
      this.notificationsSubject.next(message);
    };

    this.socket.onclose = () => {
      console.log('Disconnesso dal WebSocket');
    };

    this.socket.onerror = (error) => {
      console.error('Errore WebSocket:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
