import { Routes } from '@angular/router';
import { InitialFormComponent } from './components/initial-form/initial-form.component';
import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import { EditPersonalDataComponent } from './components/edit-personal-data/edit-personal-data.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: InitialFormComponent },
  { path: 'personal-data', component: PersonalDataComponent },
  { path: 'edit-personal-data', component: EditPersonalDataComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
