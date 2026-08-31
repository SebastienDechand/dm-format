// app.routes.ts mis à jour avec resolvers
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { HomeResolver } from './resolver/home.resolver';
import { TrainingResolver } from './resolver/training.resolver';
import { AboutResolver } from './resolver/about.resolver';
import { OrganisationResolver } from './resolver/organisation.resolver';
import { ContactResolver } from './resolver/contact.resolver';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: {
      homeData: HomeResolver,
    },
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'trainings', pathMatch: 'full' },
      {
        path: 'trainings',
        loadComponent: () =>
          import(
            './pages/admin/admin-trainings-list/admin-trainings-list.component'
          ).then((m) => m.AdminTrainingsListComponent),
      },
      {
        path: 'trainings/new',
        loadComponent: () =>
          import(
            './pages/admin/admin-training-form/admin-training-form.component'
          ).then((m) => m.AdminTrainingFormComponent),
      },
      {
        path: 'trainings/:id',
        loadComponent: () =>
          import(
            './pages/admin/admin-training-form/admin-training-form.component'
          ).then((m) => m.AdminTrainingFormComponent),
        resolve: { program: TrainingResolver },
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import(
            './pages/admin/admin-gallery-list/admin-gallery-list.component'
          ).then((m) => m.AdminGalleryListComponent),
      },
      {
        path: 'gallery/:id',
        loadComponent: () =>
          import(
            './pages/admin/admin-gallery-form/admin-gallery-form.component'
          ).then((m) => m.AdminGalleryFormComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import(
            './pages/admin/admin-about-form/admin-about-form.component'
          ).then((m) => m.AdminAboutFormComponent),
        resolve: { aboutData: AboutResolver },
      },
      {
        path: 'organisation',
        loadComponent: () =>
          import(
            './pages/admin/admin-organisation-form/admin-organisation-form.component'
          ).then((m) => m.AdminOrganisationFormComponent),
        resolve: { organisationData: OrganisationResolver },
      },
      {
        path: 'home',
        loadComponent: () =>
          import(
            './pages/admin/admin-home-form/admin-home-form.component'
          ).then((m) => m.AdminHomeFormComponent),
        resolve: { homeData: HomeResolver },
      },
    ],
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
    resolve: {
      aboutData: AboutResolver,
    },
  },
  {
    path: 'organisation',
    loadComponent: () =>
      import('./pages/organisation/organisation.component').then(
        (m) => m.OrganisationComponent
      ),
    resolve: {
      organisationData: OrganisationResolver,
    },
  },
  {
    path: 'trainings/:id',
    loadComponent: () =>
      import('./pages/program-detail/program-detail.component').then(
        (m) => m.ProgramDetailComponent
      ),
    resolve: {
      program: TrainingResolver,
    },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
    resolve: {
      contactData: ContactResolver,
    },
  },

  { path: '**', redirectTo: '' },
];
