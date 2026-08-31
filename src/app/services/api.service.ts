import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { About } from '../models/about.models';
import { ContactData } from '../models/contact.models';
import { GalleryImage } from '../models/gallery.models';
import { ConditionsData } from '../models/organisation.models';
import { Program } from '../models/programs.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

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

  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/trainings`);
  }

  getProgramById(id: string): Observable<Program> {
    return this.http.get<Program>(`${this.apiUrl}/trainings/${id}`);
  }

  patchProgramById(id: string, data: Program): Observable<Program> {
    return this.http.patch<Program>(`${this.apiUrl}/trainings/${id}`, data);
  }

  createProgram(data: Partial<Program>): Observable<Program> {
    return this.http.post<Program>(`${this.apiUrl}/trainings`, data);
  }

  deleteProgram(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/trainings/${id}`);
  }

  uploadPagePdf(pageId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/pdfs/${pageId}`, formData);
  }

  getPagePdfs(pageId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pdfs/${pageId}`);
  }

  deletePagePdf(pageId: string, publicId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/pdfs/${pageId}/${encodeURIComponent(publicId)}`
    );
  }
}
