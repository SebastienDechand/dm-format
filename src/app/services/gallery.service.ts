import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GalleryImage } from '../models/gallery.models';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private jsonUrl = 'assets/data/gallery.json';

  constructor(private http: HttpClient) {}

  getGalleryImages(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(this.jsonUrl);
  }
}
