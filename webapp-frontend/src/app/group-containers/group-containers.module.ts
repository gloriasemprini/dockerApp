import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupContainersComponent } from './group-containers.component';
import { GroupContainerService } from '../services/group-container.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, GroupContainersComponent],
  providers: [GroupContainerService],
  exports: [GroupContainersComponent],
})
export class GroupContainerModule {}
