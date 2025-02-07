import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { Observable, firstValueFrom } from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterLink],
})
export class ProfileComponent implements OnInit {
  userId!: string;
  errorMessage: string = '';
  successMessage: string = '';
  userProfile$: Observable<any> = new Observable();

  editingField: string | null = null;
  updatedData: any = {
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
  };

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.loadProfile();
  }

  loadProfile(): void {
    this.userProfile$ = this.profileService.getProfile(this.userId);
  }

  async saveChanges(field: string): Promise<void> {
    try {
      switch (field) {
        case 'name':
        case 'surname':
          await firstValueFrom(
            this.profileService.updateNameSurname(this.userId, {
              name: this.updatedData.name,
              surname: this.updatedData.surname,
            })
          );
          break;
        case 'username':
          await firstValueFrom(
            this.profileService.updateUsername(this.userId, {
              username: this.updatedData.username,
            })
          );
          break;
        case 'email':
          await firstValueFrom(
            this.profileService.updateEmail(this.userId, {
              email: this.updatedData.email,
            })
          );
          break;
        case 'password':
          await firstValueFrom(
            this.profileService.changePassword(this.userId, {
              password: this.updatedData.password,
            })
          );
          break;
      }
      this.successMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} aggiornato con successo!`;
      this.loadProfile();
      this.editingField = null;
    } catch (error) {
      this.errorMessage = `Errore nell'aggiornamento di ${field}`;
    }
  }

  cancelEdit(): void {
    this.editingField = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  enableEdit(field: string, currentValue: string = ''): void {
    this.editingField = field;
    this.updatedData[field] = currentValue;
  }

  async deleteProfile(): Promise<void> {
    if (confirm('Sei sicuro di voler eliminare il tuo profilo? Questa operazione è irreversibile.')) {
      try {
        await firstValueFrom(this.profileService.deleteProfile(this.userId));
        this.successMessage = 'Profilo eliminato con successo!';
        this.authService.logout();
        await this.router.navigate(['login']);
      } catch (error) {
        this.errorMessage = 'Errore durante l\'eliminazione del profilo.';
      }
    }
  }
}
