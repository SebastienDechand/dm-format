import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { About } from '../models/about.models';
import { ConditionsData } from '../models/organisation.models';
import { ContactData } from '../models/contact.models';
import { Program } from '../models/programs.models';
import { GalleryImage } from '../models/gallery.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAbout(): Observable<About> {
    return this.http.get<About>(`${this.apiUrl}/pages/about`);
  }

  getHome(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pages/home`);
  }

  getContact(): Observable<ContactData> {
    return this.http.get<ContactData>(`${this.apiUrl}/pages/contact`);
  }

  getOrganisation(): Observable<ConditionsData> {
    return this.http.get<ConditionsData>(`${this.apiUrl}/pages/organisation`);
  }

  getGallery(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.apiUrl}/gallery`);
  }

  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/trainings`);
  }

  getProgramById(id: string): Observable<Program> {
    return this.http.get<Program>(`${this.apiUrl}/trainings/${id}`);
  }
}
