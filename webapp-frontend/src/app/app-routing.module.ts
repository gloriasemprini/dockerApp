import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { GroupContainersComponent } from './group-containers/group-containers.component';
import { AuthGuard } from './services/auth.guard';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { ProfileComponent } from './profile/profile.component';
import { RegistrationComponent } from './registration/registration.component';
import { GroupDetailComponent } from './groups/group-detail/group-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'groups', component: GroupListComponent, canActivate: [AuthGuard] },
  { path: 'groups/:groupId', component: GroupContainersComponent, canActivate: [AuthGuard] },
  { path: 'groups/:groupId/info', component: GroupDetailComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
