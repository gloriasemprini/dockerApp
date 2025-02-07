import {firstValueFrom, map, Observable, of, tap} from 'rxjs';
import {Component, OnInit} from '@angular/core';
import {GroupService} from '../../services/group.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  imports: [
    AsyncPipe,
    NgClass,
    NgIf,
    NgForOf,
    FormsModule,
    RouterLink,
  ],
  styleUrls: ['./group-detail.component.scss']
})

export class GroupDetailComponent implements OnInit {
  groupName: string = '';
  groupId: string = '';
  error: string = '';
  availableUsers$: Observable<any[]> = new Observable();
  groupUsers$: Observable<any[]> = new Observable();
  excludeUsers$: Observable<any[]> = new Observable();
  groupDetails: any = {};
  isAdmin: boolean = false;
  originalGroupName: string = '';
  isInviteUserModalOpen: boolean = false;
  isRemoveUserModalOpen: boolean = false;
  isPromoteUserModalOpen: boolean = false;
  isEditing: boolean = false;
  isCurrentUserAdmin = false;

  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.groupId = params.get('groupId') || '';
      this.loadGroupDetails();
      this.loadGroupUsers();
      this.loadExcluseUser();
      this.excludeUsers$.subscribe(groupUsers => {
        console.log('Utenti nel gruppo:', groupUsers);
      });
    });
  }

  loadGroupDetails(): void {
    this.groupService.getGroupDetails(this.groupId).pipe(
      tap(group => {
        console.log(group);
        this.groupDetails = group;
        this.groupName = group.name;
        this.originalGroupName = group.name;
        console.log(this.originalGroupName);

        // Controlla se l'utente è admin
        this.isAdmin = group.admin.toString() === localStorage.getItem('userId');
        this.isCurrentUserAdmin = this.isAdmin;

        console.log('Is Admin:', this.isAdmin);
        console.log('User ID in localStorage:', localStorage.getItem('userId'));
        console.log('Group admin ID:', group.admin);
      }),
      catchError(error => {
        console.log('problemi');
        this.error = 'Errore nel caricamento dei dettagli del gruppo';
        console.error(error);
        return of(null);
      })
    ).subscribe();
  }

  loadGroupUsers(): void {
    this.groupUsers$ = this.groupService.getGroupUsers(this.groupId);
  }

  openInviteUserModal(): void {
    if (this.isAdmin) {
      this.isInviteUserModalOpen = true;
      this.loadAvailableUsers();
    }
  }

  closeInviteModal(): void {
    this.isInviteUserModalOpen = false;
  }

  openRemoveUserModal(): void {
    if (this.isAdmin) {
      this.isRemoveUserModalOpen = true;
    }
  }

  closeRemoveUserModal(): void {
    this.isRemoveUserModalOpen = false;
  }

  openPromoteUserModal(): void {
    if (this.isAdmin) {
      this.isPromoteUserModalOpen = true;
    }
  }

  closePromoteUserModal(): void {
    this.isPromoteUserModalOpen = false;
  }

  loadAvailableUsers(): void {
    this.availableUsers$ = this.groupService.getAvailableUsers(this.groupId);
  }

  async inviteUser(userId: string): Promise<void> {
    try {
      await firstValueFrom(this.groupService.addUser(this.groupId, userId));
      this.loadGroupUsers();
      this.closeInviteModal();
    } catch (error) {
      console.error('Errore durante l\'invito dell\'utente:', error);
    }
  }

  async removeUser(userId: string): Promise<void> {
    try {
      await firstValueFrom(this.groupService.removeUser(this.groupId, userId));
      this.loadGroupUsers();
      this.closeRemoveUserModal();
    } catch (error) {
      console.error('Errore nella rimozione dell\'utente:', error);
    }
  }

  loadExcluseUser(): void {
    this.excludeUsers$ = this.groupService.getGroupUsers(this.groupId).pipe(
      map((users: { _id: string }[]) => users.filter(user => user._id !== localStorage.getItem('userId')))
    );
  }

  async promoteUser(userId: string): Promise<void> {
    try {
      await firstValueFrom(this.groupService.promoteToAdmin(this.groupId, userId));
      this.closePromoteUserModal();
      this.loadGroupUsers();
    } catch (error) {
      console.error('Errore nel promuovere l\'utente:', error);
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  // Annulla la modifica
  cancelEditing(): void {
    this.isEditing = false;
    this.groupName = this.originalGroupName;
  }

  confirmEditing(): void {
    if (this.groupName !== this.originalGroupName) {
      this.groupService.updateGroupName(this.groupId, this.groupName).pipe(
        catchError((error) => {
          this.error = 'Errore nell\'aggiornare il nome del gruppo';
          console.error(error);
          return of(null);
        })
      ).subscribe((response) => {
        if (response && response.length > 0) {
          console.log('Gruppo aggiornato con successo');
          this.originalGroupName = this.groupName;
          this.isEditing = false;
        } else {
          console.error('Errore durante l\'aggiornamento del gruppo');
        }
      });
    } else {
      this.isEditing = false;
    }
  }

  async leaveGroup(): Promise<void> {
    try {
      await firstValueFrom(this.groupService.leaveGroup(this.groupId, (localStorage.getItem('userId') || '')));
      alert('Uscito dal gruppo con successo!');
    } catch (error) {
      console.error('Errore durante l\'uscita dal gruppo:', error);
    }
  }

  async adminLeaveGroup(): Promise<void> {
    try {
      await firstValueFrom(this.groupService.adminLeaveGroup(this.groupId, (localStorage.getItem('userId') || '')));
      alert('Uscito dal gruppo come admin con successo!');
    } catch (error) {
      console.error('Errore durante l\'uscita come admin:', error);
    }
  }
}
