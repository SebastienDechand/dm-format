import { Injectable } from '@angular/core';
import { Program } from '../models/programs.models';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private jsonUrl = 'assets/data/programs.json';

  constructor(private http: HttpClient) {}

  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(this.jsonUrl);
  }

  getProgramById(id: number): Observable<Program | undefined> {
    return new Observable((observer) => {
      this.getPrograms().subscribe((programs) => {
        observer.next(programs.find((program) => program.id === id));
        observer.complete();
      });
    });
  }
}
