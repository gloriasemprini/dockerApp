import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupContainerService } from '../services/group-container.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {firstValueFrom, Observable, of, tap} from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-group-containers',
  templateUrl: './group-containers.component.html',
  styleUrls: ['./group-containers.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterLink,
  ]
})
export class GroupContainersComponent implements OnInit {
  containers$: Observable<any[]> = new Observable();
  isContainerCreated = false;
  isError = false;
  groupId: string = '';
  imageName: string = '';
  portMapping: string = '8080';
  error: string = '';
  emptyMessage: string = '';
  isAdmin$: Observable<{ isAdmin: boolean }> | undefined;

  constructor(
    private groupContainerService: GroupContainerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.groupId = params.get('groupId') || '';
      console.log('groupId del onInit:', this.groupId);
      this.getContainers();
      this.isAdmin$ = this.groupContainerService.checkAdmin(this.groupId);
    });
  }

  getContainers(): void {
    this.containers$ = this.groupContainerService.listContainers(this.groupId).pipe(
      catchError((error) => {
        this.handleError(error, 'Errore nel recuperare i container');
        return of([]);
      })
    );
  }

  async createContainer(): Promise<void> {
    try {
      await firstValueFrom(this.groupContainerService.createContainer(this.groupId, this.imageName, this.portMapping));
      this.isContainerCreated = true;
      this.isError = false;
      this.getContainers();
    } catch (error) {
      this.isError = true;
      this.error = 'Errore nella creazione del container';
      console.error('Errore nella creazione del container:', error);
    }
  }

  async startContainer(containerId: string): Promise<void> {
    try {
      await firstValueFrom(this.groupContainerService.startContainer(this.groupId, containerId));
      this.getContainers();
    } catch (error) {
      this.error = 'Errore nell\'avviare il container';
      console.error('Errore nell\'avviare il container:', error);
    }
  }

  async stopContainer(containerId: string): Promise<void> {
    try {
      await firstValueFrom(this.groupContainerService.stopContainer(this.groupId, containerId));
      this.getContainers();
    } catch (error) {
      this.error = 'Errore nel fermare il container';
      console.error('Errore nel fermare il container:', error);
    }
  }

  refreshContainers(): void {
    this.getContainers();
  }

  async deleteImage(imageName: string): Promise<void> {
    try {
      await firstValueFrom(this.groupContainerService.deleteImage(this.groupId, imageName));
      this.getContainers();
    } catch (error) {
      this.error = 'Errore nell\'eliminare l\'immagine frontend';
      console.error('Errore nell\'eliminare l\'immagine frontend:', error);
    }
  }

  private handleError(error: any, message: string): void {
    this.isError = true;
    this.error = message;
    console.error(message, error);
  }
}
