import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    RouterLinkActive,
  ]
})
export class GroupListComponent implements OnInit {
  groups: any[] = [];
  newGroupName: string = '';
  error: string = '';
  emptyMessage: string = '';
  groups$: Observable<any[]> = new Observable();

  constructor(private groupService: GroupService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.error = 'Errore: Utente non autenticato.';
      return;
    }
    this.groups$ = this.groupService.listGroups();
  }

  async createGroup(): Promise<void> {
    if (this.newGroupName.trim()) {
      try {
        await firstValueFrom(this.groupService.createGroup(this.newGroupName));
        alert('Gruppo creato con successo!');
        this.loadGroups();
        this.newGroupName = '';
      } catch (error) {
        console.error('Errore nella creazione del gruppo:', error);
      }
    } else {
      alert('Il nome del gruppo non può essere vuoto.');
    }
  }

  refreshGroups(): void {
    this.loadGroups();
  }
}
