import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';
import { NgForOf, NgIf } from '@angular/common';

interface Notification {
  event: string;
  message: string;
  read: boolean;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  unreadCount = 0;
  private notificationsSubscription!: Subscription;
  dropdownOpen = false;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.websocketService.connect();

    this.notificationsSubscription = this.websocketService.notifications$.subscribe((notification: Notification) => {
      console.log("Notifica ricevuta:", notification);
      if (notification) {
        this.addNotification(notification);
      }
    });
  }

  ngOnDestroy() {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  addNotification(notification: Notification) {
    console.log("Aggiunta notifica:", notification);
    this.notifications.push({ ...notification, read: false });
    if (!this.dropdownOpen) {
      this.unreadNotifications.push(notification);
      this.unreadCount++;
    }
    console.log("Contatore non lette:", this.unreadCount);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.markAllAsRead();
    }
    console.log("Dropdown aperto:", this.dropdownOpen);
  }

  markAllAsRead() {
    console.log("Segnate tutte come lette");
    this.unreadNotifications.forEach(notification => {
      notification.read = true;
    });
    this.unreadCount = 0;
  }

  markAsRead(notification: Notification) {
    notification.read = true;
    this.unreadCount--;
    const index = this.unreadNotifications.indexOf(notification);
    if (index > -1) {
      this.unreadNotifications.splice(index, 1);
    }
  }
}
