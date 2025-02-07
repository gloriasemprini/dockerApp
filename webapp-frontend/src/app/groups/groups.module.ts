import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupContainersComponent } from '../group-containers/group-containers.component';

@NgModule({
  imports: [
    CommonModule,
    GroupListComponent,
    GroupContainersComponent
  ],
})
export class GroupModule {}
