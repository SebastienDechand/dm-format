import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProgramDetailComponent } from './pages/program-detail/program-detail.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  { path: 'program/:id', component: ProgramDetailComponent },
  {path: '**', redirectTo: ''}
];
