import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'organisation',
    loadComponent: () =>
      import('./pages/organisation/organisation.component').then(
        (m) => m.OrganisationComponent
      ),
  },
  {
    path: 'trainings/:id',
    loadComponent: () =>
      import('./pages/program-detail/program-detail.component').then(
        (m) => m.ProgramDetailComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },

  { path: '**', redirectTo: '' },
];
