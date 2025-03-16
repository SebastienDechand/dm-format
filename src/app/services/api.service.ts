import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { About } from '../models/about.models';
import { ConditionsData } from '../models/organisation.models';
import { ContactData } from '../models/contact.models';
import { Program } from '../models/programs.models';
import { GalleryImage } from '../models/gallery.models';
import { environment } from '../../environments/environment.prod';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAbout(): Observable<About> {
    return this.http.get<About>(`${this.apiUrl}/pages/about`);
  }

  patchAbout(data: About): Observable<About> {
    return this.http.patch<About>(`${this.apiUrl}/pages/about`, data);
  }

  getHome(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pages/home`);
  }

  patchHome(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/pages/home`, data);
  }

  getContact(): Observable<ContactData> {
    return this.http.get<ContactData>(`${this.apiUrl}/pages/contact`);
  }

  patchContact(data: ContactData): Observable<ContactData> {
    return this.http.patch<ContactData>(`${this.apiUrl}/pages/contact`, data);
  }

  getOrganisation(): Observable<ConditionsData> {
    return this.http.get<ConditionsData>(`${this.apiUrl}/pages/organisation`);
  }

  patchOrganisation(data: ConditionsData): Observable<ConditionsData> {
    return this.http.patch<ConditionsData>(
      `${this.apiUrl}/pages/organisation`,
      data
    );
  }

  getGallery(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.apiUrl}/gallery`);
  }

  patchGallery(data: GalleryImage[]): Observable<GalleryImage[]> {
    return this.http.patch<GalleryImage[]>(`${this.apiUrl}/gallery`, data);
  }

  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/trainings`);
  }

  patchPrograms(data: Program[]): Observable<Program[]> {
    return this.http.patch<Program[]>(`${this.apiUrl}/trainings`, data);
  }

  getProgramById(id: string): Observable<Program> {
    return this.http.get<Program>(`${this.apiUrl}/trainings/${id}`);
  }

  patchProgramById(id: string, data: Program): Observable<Program> {
    return this.http.patch<Program>(`${this.apiUrl}/trainings/${id}`, data);
  }
}
